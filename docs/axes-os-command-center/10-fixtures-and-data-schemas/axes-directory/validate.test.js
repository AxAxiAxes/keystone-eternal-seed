"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const { validate } = require("./schema-validator");
const listingSchema = require("./listing.schema.json");
const requestSchema = require("./correction-removal-request.schema.json");
const { listings } = require("./sample-listings.json");
const { requests } = require("./sample-correction-removal-requests.json");

test("every sample listing fixture is valid against listing.schema.json", () => {
  assert.ok(listings.length >= 11, "fixture should cover every lifecycle state");
  for (const listing of listings) {
    const errors = validate(listingSchema, listing);
    assert.deepEqual(errors, [], `listing ${listing.listing_id} should be valid: ${errors.join("; ")}`);
  }
});

test("sample listings cover every documented lifecycle state and all three tracks", () => {
  const statuses = new Set(listings.map((listing) => listing.status));
  const tracks = new Set(listings.map((listing) => listing.track));
  const expectedStatuses = [
    "draft", "confirmation_pending", "confirmed", "review_pending", "approved",
    "published", "correction_pending", "removal_pending", "paused", "expired", "removed"
  ];
  for (const status of expectedStatuses) {
    assert.ok(statuses.has(status), `fixture is missing an example of status "${status}"`);
  }
  for (const track of ["vendor", "contractor_trade", "real_estate_service"]) {
    assert.ok(tracks.has(track), `fixture is missing an example of track "${track}"`);
  }
});

test("every sample correction/removal request fixture is valid against correction-removal-request.schema.json", () => {
  assert.ok(requests.length > 0);
  for (const request of requests) {
    const errors = validate(requestSchema, request);
    assert.deepEqual(errors, [], `request ${request.request_id} should be valid: ${errors.join("; ")}`);
  }
});

test("rejects a listing missing a field required at its current status", () => {
  const invalid = {
    listing_id: "invalid-0001",
    track: "vendor",
    category: "Test category",
    service_area: "Test area",
    website: "https://invalid-0001.example",
    listing_source: "business_submission",
    source_received_at: "2027-01-01",
    // confirmation_capacity and confirmation_received_at are missing, but required once "confirmed"
    status: "confirmed",
    status_changed_at: "2027-01-01"
  };
  const errors = validate(listingSchema, invalid);
  assert.ok(errors.some((error) => error.includes("confirmation_capacity")), errors.join("; "));
  assert.ok(errors.some((error) => error.includes("confirmation_received_at")), errors.join("; "));
});

test("rejects a listing carrying a field outside the approved schema, such as a rating", () => {
  const invalid = {
    listing_id: "invalid-0002",
    status: "draft",
    status_changed_at: "2027-01-01",
    rating: 4.8
  };
  const errors = validate(listingSchema, invalid);
  assert.ok(errors.some((error) => error.includes("rating") && error.includes("unrecognized")), errors.join("; "));
});

test("rejects a listing with an unknown track value", () => {
  const invalid = {
    listing_id: "invalid-0003",
    business_name: "Invalid Example Co.",
    track: "premium_partner",
    category: "Test category",
    service_area: "Test area",
    website: "https://invalid-0003.example",
    listing_source: "business_submission",
    source_received_at: "2027-01-01",
    status: "confirmation_pending",
    status_changed_at: "2027-01-01"
  };
  const errors = validate(listingSchema, invalid);
  assert.ok(errors.some((error) => error.includes("track")), errors.join("; "));
});

test("rejects a listing at confirmation_pending or later with neither website nor public_contact_method", () => {
  const invalid = {
    listing_id: "invalid-0004",
    business_name: "Invalid Example Co.",
    track: "vendor",
    category: "Test category",
    service_area: "Test area",
    listing_source: "business_submission",
    source_received_at: "2027-01-01",
    status: "confirmation_pending",
    status_changed_at: "2027-01-01"
  };
  const errors = validate(listingSchema, invalid);
  assert.ok(errors.some((error) => error.includes("at least one of")), errors.join("; "));
});

test("rejects a removed listing missing removal_reason_code and removed_at", () => {
  const invalid = {
    listing_id: "invalid-0005",
    business_name: "Invalid Example Co.",
    track: "vendor",
    category: "Test category",
    service_area: "Test area",
    website: "https://invalid-0005.example",
    listing_source: "business_submission",
    source_received_at: "2025-01-01",
    confirmation_capacity: "business_owner",
    confirmation_received_at: "2025-01-02",
    human_reviewer_role: "directory_intake_reviewer",
    approved_at: "2025-01-03",
    published_at: "2025-01-04",
    last_reviewed_at: "2025-06-01",
    status: "removed",
    status_changed_at: "2025-06-01"
  };
  const errors = validate(listingSchema, invalid);
  assert.ok(errors.some((error) => error.includes("removal_reason_code")), errors.join("; "));
  assert.ok(errors.some((error) => error.includes("removed_at")), errors.join("; "));
});

test("rejects a correction/removal request with an invalid request_type", () => {
  const invalid = {
    request_id: "invalid-request-0001",
    listing_id: "example-listing-0006",
    request_type: "dispute",
    received_at: "2027-01-01",
    request_route: "published_directory_correction_form",
    review_status: "received"
  };
  const errors = validate(requestSchema, invalid);
  assert.ok(errors.some((error) => error.includes("request_type")), errors.join("; "));
});

test("rejects a decided correction/removal request missing reviewed_at", () => {
  const invalid = {
    request_id: "invalid-request-0002",
    listing_id: "example-listing-0006",
    request_type: "correction",
    received_at: "2027-01-01",
    request_route: "published_directory_correction_form",
    review_status: "implemented"
  };
  const errors = validate(requestSchema, invalid);
  assert.ok(errors.some((error) => error.includes("reviewed_at")), errors.join("; "));
});
