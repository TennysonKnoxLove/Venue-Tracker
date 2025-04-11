#!/bin/bash

echo "Removing large files from git history..."

# Remove the file from git index (but keep it on disk)
git rm --cached frontend.tar
git rm --cached "*.tar" 2>/dev/null || true
git rm --cached "*.tar.gz" 2>/dev/null || true
git rm --cached "*.zip" 2>/dev/null || true

# Commit the change
git commit -m "Remove large files from repository"

echo "Large files removed from git. You can now push to GitHub."
echo "Note: The files still exist on your disk but will be ignored by git." 