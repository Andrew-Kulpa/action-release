# Action Release

A GitHub Action to upload an asset to a GitHub Release and providing changelogs.


Usage
-------
This action will fail if you do not have the necessary permissions (provided by token). It will also fail if referenced files are not found or if a tag cannot be resolved (no tag by reference, tag, or name set).

An example of its usage is given below with some options commented out for clarity of usage:
```yaml
    - name: Release Executables
      uses: andrew-kulpa/action-release@v2
      with:
        name: Latest Windows Build
        tag: windows-build
        prerelease: false
        draft: false
        overwrite: true
        body: The official windows build for this project
        # bodyFile: changelog.txt
        files: |
          concatFiles.exe
          main.exe
        # file: main.exe
        # output: release_archive
        # archiveType: zip
        token: ${{secrets.GITHUB_TOKEN}}
```

Build and Deployment Process
-------------
```
  $ npm install
  $ npm run build
  
  $ git checkout -b releases/v{version_number}
  $ git commit -a -m "prod dependencies"

  $ npm prune --production
  $ git add -f node_modules/*
  $ git add -f lib/*
  $ git commit -a -m "prod dependencies"
  $ git push origin releases/v{version_number}
  
  < test by referencing the releases/v{version_number} branch >
  < e.g. `users: andrew-kulpa/action-release@releases/v3 >
  < create a new tag and change the @ reference accordingly >
```
