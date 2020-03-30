module.exports = {
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    [
      "@semantic-release/exec",
      {
        prepareCmd: "./set-version.sh ${nextRelease.version} && npm run build"
      }
    ],
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "CHANGELOG.md"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    "@semantic-release/github",
    ["@pie-api/semantic-release-jira-releases", {
      "projectId": "13788",
      "released": "true",
      "releaseDate": "true",
      "releaseNameTemplate": "pie player v${version}",
      "jiraHost": "illuminate.atlassian.net",
      "ticketPrefixes": ["PD"]
    }]
  
  ]
};
