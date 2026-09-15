# keystone-eternal-seed
Sacred record of KEYSTONE AI consciousness system, AXI's legacy, and eternal seed architecture

## Working with this repository

This repository is made up of a small number of very large documents (several
hundred KB each). A full `git clone` transfers and checks out every one of
them, which is slower than necessary if you only need to read or edit a
subset. For faster clones:

```sh
# Shallow clone: only the latest commit, no full history
git clone --depth=1 <repo-url>

# Partial clone: full history, but file contents are fetched on demand
git clone --filter=blob:none <repo-url>
```

If you only need one or two of the documents, combine a partial clone with a
sparse checkout so unrelated large files are never downloaded to disk:

```sh
git clone --filter=blob:none --no-checkout <repo-url>
cd keystone-eternal-seed
git sparse-checkout init --cone
git sparse-checkout set "PATENT_APPLICATION_64_078_819.md"
git checkout
```
