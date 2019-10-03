# Action Releases

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
      env:
        GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

Build Process
-------------
```
  $ npm install
  $ npm run build
  
  $ git checkout -b releases/v{version_number}
  $ git commit -a -m "prod dependencies"

  $ npm prune --production
  $ git add node_modules
  $ git commit -a -m "prod dependencies"
  $ git push origin releases/v{version_number}
```