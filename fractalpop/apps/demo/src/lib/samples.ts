/** Sample snippets for every language in the playground dropdown (31 total). */
export interface Sample { lang: string; label: string; file: string; code: string }

export const samples: Sample[] = [
  {
    "lang": "sass",
    "label": "Sass (indented)",
    "file": "card.sass",
    "code": "// theme tokens\n$brand: hsl(212, 90%, 55%)\n$pad: 1rem\n\n@mixin card($radius: 0.5rem)\n  border-radius: $radius\n  padding: $pad\n\n.card\n  color: $brand\n  +card(0.75rem)\n  &:hover\n    background: darken($brand, 8%) !important"
  },
  {
    "lang": "scss",
    "label": "SCSS",
    "file": "card.scss",
    "code": "$brand: #cd6799;\n\n@mixin flex($dir: row) {\n  display: flex;\n  flex-direction: $dir;\n}\n\n.card {\n  color: $brand; // accent\n  &:hover { color: darken($brand, 10%); }\n}"
  },
  {
    "lang": "svelte",
    "label": "Svelte (composite)",
    "file": "Counter.svelte",
    "code": "<script lang=\"ts\">\n  let count: number = $state(0)\n  const label = 'clicks'\n</script>\n\n<button class=\"counter\" onclick={() => count++}>\n  {label}: {count}\n</button>\n\n<style lang=\"sass\">\n  .counter\n    color: $brand\n    &:hover\n      opacity: 0.8\n</style>"
  },
  {
    "lang": "javascript",
    "label": "JavaScript",
    "file": "App.jsx",
    "code": "export default function App() {\n  return (\n    <>\n      <h1 id=\"title\">\n        Hello\n        <span> world</span>\n      </h1>\n      <div style={styles.bar} />\n    </>\n  )\n}"
  },
  {
    "lang": "typescript",
    "label": "TypeScript",
    "file": "user.ts",
    "code": "type User = { name: string; active: boolean }\n\nconst user: User = {\n  name: 'Ada', active: true\n}"
  },
  {
    "lang": "css",
    "label": "CSS",
    "file": "card.css",
    "code": "/* A responsive project card */\n:root {\n  --theme-color: #f47067;\n  --bg-surface: #f6f6f6;\n}\n\n.card {\n  display: grid;\n  gap: 1rem;\n  padding: 1.5rem;\n  border-radius: 12px;\n  background: var(--bg-surface);\n  color: #354150;\n}\n\n.card a:hover {\n  color: var(--theme-color);\n  text-decoration: underline;\n}\n\n@media (min-width: 720px) {\n  .card {\n    grid-template-columns: 1fr 2fr;\n    align-items: start;\n  }\n}"
  },
  {
    "lang": "python",
    "label": "Python",
    "file": "fib.py",
    "code": "from dataclasses import dataclass\n\n@dataclass\nclass Project:\n    name: str\n    stars: int\n    active: bool = True\n\n\ndef popular_projects(projects: list[Project]) -> list[str]:\n    # Keep active projects with at least 100 stars.\n    return [\n        f\"{project.name}: {project.stars:,} stars\"\n        for project in projects\n        if project.active and project.stars >= 100\n    ]\n\n\nprojects = [\n    Project(\"Sugar High\", 1200),\n    Project(\"Code Garden\", 480),\n    Project(\"Old Notes\", 250, active=False),\n]\n\nfor summary in popular_projects(projects):\n    print(summary)"
  },
  {
    "lang": "rust",
    "label": "Rust",
    "file": "main.rs",
    "code": "struct Project {\n    name: &'static str,\n    stars: u32,\n    active: bool,\n}\n\nfn main() {\n    let projects = [\n        Project { name: \"Sugar High\", stars: 1200, active: true },\n        Project { name: \"Code Garden\", stars: 480, active: true },\n        Project { name: \"Old Notes\", stars: 250, active: false },\n    ];\n\n    // Borrow each project without consuming the collection.\n    let featured: Vec<_> = projects\n        .iter()\n        .filter(|project| project.active)\n        .collect();\n\n    for project in &featured {\n        println!(\"{}: {} stars\", project.name, project.stars);\n    }\n\n    let total: u32 = featured.iter().map(|p| p.stars).sum();\n    println!(\"Total stars: {total}\");\n}"
  },
  {
    "lang": "go",
    "label": "Go",
    "file": "main.go",
    "code": "package main\n\nimport \"fmt\"\n\ntype Project struct {\n    Name   string\n    Stars  int\n    Active bool\n}\n\nfunc main() {\n    projects := []Project{\n        {Name: \"Sugar High\", Stars: 1200, Active: true},\n        {Name: \"Code Garden\", Stars: 480, Active: true},\n        {Name: \"Old Notes\", Stars: 250, Active: false},\n    }\n\n    // Skip archived projects.\n    total := 0\n    for _, project := range projects {\n        if !project.Active {\n            continue\n        }\n        total += project.Stars\n        fmt.Printf(\"%s: %d stars\\n\", project.Name, project.Stars)\n    }\n    fmt.Printf(\"Total: %d\\n\", total)\n}"
  },
  {
    "lang": "java",
    "label": "Java",
    "file": "Main.java",
    "code": "import java.util.List;\n\npublic class ProjectFeed {\n    record Project(String name, int stars, boolean active) {}\n\n    public static void main(String[] args) {\n        var projects = List.of(\n            new Project(\"Sugar High\", 1200, true),\n            new Project(\"Code Garden\", 480, true),\n            new Project(\"Old Notes\", 250, false)\n        );\n\n        // Keep the active projects in the feed.\n        var featured = projects.stream()\n            .filter(Project::active)\n            .filter(project -> project.stars() >= 100)\n            .toList();\n\n        for (var project : featured) {\n            System.out.printf(\"%s: %d stars%n\",\n                project.name(), project.stars());\n        }\n        System.out.println(\"Featured: \" + featured.size());\n    }\n}"
  },
  {
    "lang": "cpp",
    "label": "C++",
    "file": "main.cpp",
    "code": "#include <iostream>\n#include <string>\n#include <vector>\n\nstruct Project {\n    std::string name;\n    int stars;\n    bool active;\n};\n\nint main() {\n    const std::vector<Project> projects = {\n        {\"Sugar High\", 1200, true},\n        {\"Code Garden\", 480, true},\n        {\"Old Notes\", 250, false},\n    };\n\n    // References avoid copying each project.\n    int total = 0;\n    for (const auto& project : projects) {\n        if (!project.active) continue;\n        total += project.stars;\n        std::cout << project.name << \": \" << project.stars << '\\n';\n    }\n    std::cout << \"Total stars: \" << total << '\\n';\n    return 0;\n}"
  },
  {
    "lang": "c",
    "label": "C",
    "file": "main.c",
    "code": "#include <stdbool.h>\n#include <stdio.h>\n\ntypedef struct {\n    const char *name;\n    int stars;\n    bool active;\n} Project;\n\nint main(void) {\n    const Project projects[] = {\n        {\"Sugar High\", 1200, true},\n        {\"Code Garden\", 480, true},\n        {\"Old Notes\", 250, false},\n    };\n    const size_t count = sizeof projects / sizeof projects[0];\n\n    // Print the projects that are still maintained.\n    for (size_t i = 0; i < count; ++i) {\n        if (!projects[i].active) continue;\n        printf(\"%s: %d stars\\n\", projects[i].name, projects[i].stars);\n    }\n\n    return 0;\n}"
  },
  {
    "lang": "csharp",
    "label": "C#",
    "file": "Program.cs",
    "code": "using System;\nusing System.Linq;\n\nvar projects = new[]\n{\n    new Project(\"Sugar High\", 1200, true),\n    new Project(\"Code Garden\", 480, true),\n    new Project(\"Old Notes\", 250, false),\n};\n\n// Build a ranked feed of active projects.\nvar featured = projects\n    .Where(project => project.Active)\n    .OrderByDescending(project => project.Stars)\n    .Take(3)\n    .ToArray();\n\nforeach (var project in featured)\n{\n    Console.WriteLine($\"{project.Name}: {project.Stars:N0} stars\");\n}\n\nConsole.WriteLine($\"Featured projects: {featured.Length}\");\n\nrecord Project(string Name, int Stars, bool Active);"
  },
  {
    "lang": "ruby",
    "label": "Ruby",
    "file": "app.rb",
    "code": "Project = Struct.new(:name, :stars, :active, keyword_init: true)\n\nprojects = [\n  Project.new(name: \"Sugar High\", stars: 1200, active: true),\n  Project.new(name: \"Code Garden\", stars: 480, active: true),\n  Project.new(name: \"Old Notes\", stars: 250, active: false)\n]\n\ndef featured_projects(projects, minimum: 100)\n  projects\n    .select { |project| project.active && project.stars >= minimum }\n    .sort_by { |project| -project.stars }\nend\n\n# Keyword arguments make the filter easy to customize.\nfeatured = featured_projects(projects, minimum: 200)\n\nfeatured.each_with_index do |project, index|\n  puts \"#{index + 1}. #{project.name}: #{project.stars} stars\"\nend\n\ntotal = featured.sum(&:stars)\nputs \"Featured projects: #{featured.length}\"\nputs \"Total stars: #{total}\""
  },
  {
    "lang": "php",
    "label": "PHP",
    "file": "index.php",
    "code": "<?php\n\ndeclare(strict_types=1);\n\n$projects = [\n    ['name' => 'Sugar High', 'stars' => 1200, 'active' => true],\n    ['name' => 'Code Garden', 'stars' => 480, 'active' => true],\n    ['name' => 'Old Notes', 'stars' => 250, 'active' => false],\n];\n\nfunction featuredProjects(array $projects, int $minimum = 100): array\n{\n    return array_values(array_filter(\n        $projects,\n        fn (array $project): bool =>\n            $project['active'] && $project['stars'] >= $minimum\n    ));\n}\n\n// Escape names before rendering them into a page.\nforeach (featuredProjects($projects) as $project) {\n    $name = htmlspecialchars($project['name'], ENT_QUOTES, 'UTF-8');\n    $stars = number_format($project['stars']);\n    echo \"<p>{$name}: {$stars} stars</p>\";\n}"
  },
  {
    "lang": "swift",
    "label": "Swift",
    "file": "main.swift",
    "code": "struct Project {\n    let name: String\n    let stars: Int\n    var active = true\n}\n\nlet projects = [\n    Project(name: \"Sugar High\", stars: 1200),\n    Project(name: \"Code Garden\", stars: 480),\n    Project(name: \"Old Notes\", stars: 250, active: false),\n]\n\n// Filter and rank the projects for a small feed.\nlet featured = projects\n    .filter { $0.active && $0.stars >= 100 }\n    .sorted { $0.stars > $1.stars }\n\nfor (index, project) in featured.enumerated() {\n    print(\"\\(index + 1). \\(project.name): \\(project.stars) stars\")\n}\n\nlet total = featured.reduce(0) { sum, project in\n    sum + project.stars\n}\nprint(\"Total stars: \\(total)\")"
  },
  {
    "lang": "kotlin",
    "label": "Kotlin",
    "file": "Main.kt",
    "code": "data class Project(\n    val name: String,\n    val stars: Int,\n    val active: Boolean = true,\n)\n\nfun main() {\n    val projects = listOf(\n        Project(\"Sugar High\", 1200),\n        Project(\"Code Garden\", 480),\n        Project(\"Old Notes\", 250, active = false),\n    )\n\n    // Collection operations leave the original list unchanged.\n    val featured = projects\n        .filter { it.active && it.stars >= 100 }\n        .sortedByDescending { it.stars }\n\n    featured.forEachIndexed { index, project ->\n        println(\"${index + 1}. ${project.name}: ${project.stars} stars\")\n    }\n\n    val total = featured.sumOf { it.stars }\n    println(\"Total stars: $total\")\n}"
  },
  {
    "lang": "sql",
    "label": "SQL",
    "file": "query.sql",
    "code": "-- Rank active projects by recent activity.\nWITH recent_stars AS (\n  SELECT\n    project_id,\n    COUNT(*) AS star_count\n  FROM stars\n  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'\n  GROUP BY project_id\n)\nSELECT\n  projects.name,\n  owners.username AS owner,\n  COALESCE(recent_stars.star_count, 0) AS recent_stars,\n  CASE\n    WHEN recent_stars.star_count >= 100 THEN 'trending'\n    ELSE 'discover'\n  END AS category\nFROM projects\nJOIN users AS owners ON owners.id = projects.owner_id\nLEFT JOIN recent_stars ON recent_stars.project_id = projects.id\nWHERE projects.archived_at IS NULL\nORDER BY recent_stars DESC, projects.name ASC\nLIMIT 10;"
  },
  {
    "lang": "json",
    "label": "JSON",
    "file": "data.json",
    "code": "{\n  \"name\": \"project-gallery\",\n  \"private\": true,\n  \"theme\": \"taffy\",\n  \"editor\": {\n    \"language\": \"typescript\",\n    \"lineNumbers\": true,\n    \"fontSize\": 14,\n    \"highlightLines\": [1, [5, 8]]\n  },\n  \"projects\": [\n    {\n      \"name\": \"Sugar High\",\n      \"stars\": 1200,\n      \"tags\": [\"syntax\", \"javascript\"]\n    },\n    {\n      \"name\": \"Code Garden\",\n      \"stars\": 480,\n      \"tags\": [\"editor\", \"react\"]\n    }\n  ],\n  \"archivedAt\": null\n}"
  },
  {
    "lang": "yaml",
    "label": "YAML",
    "file": "config.yaml",
    "code": "# Configuration for the project gallery.\nname: project-gallery\nversion: 1\n\ndefaults: &defaults\n  theme: taffy\n  line_numbers: true\n  font_size: 14\n\npreviews:\n  - name: javascript\n    <<: *defaults\n    source: examples/greeting.js\n  - name: python\n    <<: *defaults\n    source: examples/greeting.py\n\nnavigation:\n  title: Explore projects\n  links:\n    - label: Documentation\n      href: /docs\n    - label: Examples\n      href: /examples\n\nsummary: |\n  Small tools for expressive interfaces.\n  Pick a language to explore its syntax."
  },
  {
    "lang": "toml",
    "label": "TOML",
    "file": "config.toml",
    "code": "# Project gallery settings\n[site]\ntitle = \"Project Gallery\"\ndescription = \"Small tools for expressive interfaces\"\nbase_url = \"https://example.com\"\n\n[editor]\ntheme = \"taffy\"\nfont_size = 14\nline_numbers = true\nlanguages = [\"javascript\", \"typescript\", \"python\"]\n\n[editor.layout]\npadding = \"1rem\"\nmax_height = 520\nwrap_lines = true\n\n[[projects]]\nname = \"Sugar High\"\nstars = 1200\nactive = true\n\n[[projects]]\nname = \"Code Garden\"\nstars = 480\nactive = true"
  },
  {
    "lang": "html",
    "label": "HTML",
    "file": "index.html",
    "code": "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Project Gallery</title>\n    <link rel=\"stylesheet\" href=\"/styles.css\" />\n  </head>\n  <body>\n    <main>\n      <header>\n        <h1>Small projects, bright ideas</h1>\n        <p>A collection of tools for the web.</p>\n      </header>\n\n      <!-- Each card links to a project. -->\n      <article class=\"card\" data-featured=\"true\">\n        <h2><a href=\"/projects/sugar-high\">Sugar High</a></h2>\n        <p>Lightweight syntax highlighting.</p>\n        <ul aria-label=\"Project tags\">\n          <li>JavaScript</li>\n          <li>Zero dependencies</li>\n        </ul>\n      </article>\n    </main>\n  </body>\n</html>"
  },
  {
    "lang": "markdown",
    "label": "Markdown",
    "file": "README.md",
    "code": "# Project Gallery\n\nSmall tools for **expressive interfaces** and readable code.\n\n## Featured projects\n\n| Project | Language | Stars |\n| --- | --- | ---: |\n| Sugar High | JavaScript | 1,200 |\n| Code Garden | TypeScript | 480 |\n\n### Getting started\n\n1. Choose a project from the gallery.\n2. Read its [documentation](/docs).\n3. Try the example below.\n\n```javascript\nconst message = \"Small code, bright ideas\"\nconsole.log(message)\n```\n\n> Keep the interface simple and let the code speak.\n\n- [x] Browse projects\n- [x] Preview themes\n- [ ] Share a favorite"
  },
  {
    "lang": "shell",
    "label": "Shell",
    "file": "deploy.sh",
    "code": "#!/usr/bin/env bash\nset -euo pipefail\n\n# Summarize source files without modifying them.\nsource_dir=\"${1:-src}\"\nextensions=(js ts tsx)\ntotal=0\n\nif [[ ! -d \"$source_dir\" ]]; then\n  printf 'Directory not found: %s\\n' \"$source_dir\" >&2\n  exit 1\nfi\n\nfor extension in \"${extensions[@]}\"; do\n  count=0\n  while IFS= read -r -d '' file; do\n    printf '  %s\\n' \"$file\"\n    count=$((count + 1))\n  done < <(find \"$source_dir\" -type f -name \"*.$extension\" -print0)\n\n  printf '%s files: %d\\n' \"$extension\" \"$count\"\n  total=$((total + count))\ndone\n\nprintf 'Total source files: %d\\n' \"$total\""
  },
  {
    "lang": "powershell",
    "label": "PowerShell",
    "file": "script.ps1",
    "code": "param(\n    [string]$SourceDirectory = \"src\",\n    [string[]]$Extensions = @(\".js\", \".ts\", \".tsx\")\n)\n\n$ErrorActionPreference = \"Stop\"\n\nfunction Get-SourceSummary {\n    param([string]$Directory)\n\n    # Report matching files without changing them.\n    Get-ChildItem -Path $Directory -Recurse -File |\n        Where-Object { $_.Extension -in $Extensions } |\n        Select-Object Name, Extension, Length\n}\n\nif (-not (Test-Path -LiteralPath $SourceDirectory)) {\n    throw \"Directory not found: $SourceDirectory\"\n}\n\n$files = @(Get-SourceSummary -Directory $SourceDirectory)\n$files | Sort-Object Name | Format-Table -AutoSize\n\n$totalBytes = ($files | Measure-Object Length -Sum).Sum\nWrite-Host \"Source files: $($files.Count)\"\nWrite-Host \"Total bytes: $totalBytes\""
  },
  {
    "lang": "dockerfile",
    "label": "Dockerfile",
    "file": "Dockerfile",
    "code": "# Build the site in a separate stage.\nFROM node:24-alpine AS builder\nWORKDIR /app\n\nCOPY package.json package-lock.json ./\nRUN npm ci\n\nCOPY . .\nRUN npm run build\n\n# Serve static output from a small runtime image.\nFROM nginx:alpine AS runtime\n\nLABEL org.opencontainers.image.title=\"Project Gallery\"\nLABEL org.opencontainers.image.description=\"Static project previews\"\n\nCOPY --from=builder /app/dist /usr/share/nginx/html\n\n# Check that the server responds before routing traffic.\nHEALTHCHECK --interval=30s --timeout=3s \\\n  CMD wget -q -O /dev/null http://localhost/ || exit 1\n\nEXPOSE 80\nSTOPSIGNAL SIGQUIT\nCMD [\"nginx\", \"-g\", \"daemon off;\"]"
  },
  {
    "lang": "graphql",
    "label": "GraphQL",
    "file": "schema.graphql",
    "code": "# Fetch a small feed with reusable project fields.\nquery FeaturedProjects($limit: Int! = 3, $includeOwner: Boolean! = true) {\n  projects(first: $limit, active: true) {\n    nodes {\n      ...ProjectSummary\n      owner @include(if: $includeOwner) {\n        id\n        username\n        avatarUrl\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n\nfragment ProjectSummary on Project {\n  id\n  name\n  description\n  stars\n  languages {\n    name\n    color\n  }\n}"
  },
  {
    "lang": "hcl",
    "label": "HCL / Terraform",
    "file": "main.tf",
    "code": "# A local Terraform example; no cloud account is needed.\nterraform {\n  required_version = \">= 1.4.0\"\n}\n\nvariable \"projects\" {\n  type = map(number)\n  default = {\n    \"sugar-high\"  = 1200\n    \"code-garden\" = 480\n  }\n}\n\nlocals {\n  featured = {\n    for name, stars in var.projects : name => stars\n    if stars >= 100\n  }\n}\n\nresource \"terraform_data\" \"project\" {\n  for_each = local.featured\n  input = { name = each.key, stars = each.value }\n}\n\noutput \"featured_names\" {\n  value = sort(keys(local.featured))\n}"
  },
  {
    "lang": "zig",
    "label": "Zig",
    "file": "main.zig",
    "code": "const std = @import(\"std\");\n\nconst Project = struct {\n    name: []const u8,\n    stars: u32,\n    active: bool = true,\n};\n\npub fn main() void {\n    const projects = [_]Project{\n        .{ .name = \"Sugar High\", .stars = 1200 },\n        .{ .name = \"Code Garden\", .stars = 480 },\n        .{ .name = \"Old Notes\", .stars = 250, .active = false },\n    };\n\n    // Iterate over the active projects without allocating.\n    var total: u32 = 0;\n    for (projects) |project| {\n        if (!project.active) continue;\n        total += project.stars;\n        std.debug.print(\"{s}: {d} stars\\n\", .{\n            project.name,\n            project.stars,\n        });\n    }\n    std.debug.print(\"Total stars: {d}\\n\", .{total});\n}"
  },
  {
    "lang": "lua",
    "label": "Lua",
    "file": "init.lua",
    "code": "local projects = {\n  { name = \"Sugar High\", stars = 1200, active = true },\n  { name = \"Code Garden\", stars = 480, active = true },\n  { name = \"Old Notes\", stars = 250, active = false },\n}\n\nlocal function featured_projects(items)\n  local featured = {}\n  for _, project in ipairs(items) do\n    if project.active and project.stars >= 100 then\n      table.insert(featured, project)\n    end\n  end\n  table.sort(featured, function(a, b)\n    return a.stars > b.stars\n  end)\n  return featured\nend\n\n-- Print a numbered feed of active projects.\nfor index, project in ipairs(featured_projects(projects)) do\n  print(string.format(\"%d. %s: %d stars\",\n    index, project.name, project.stars))\nend"
  },
  {
    "lang": "diff",
    "label": "Diff",
    "file": "change.diff",
    "code": "diff --git a/src/projects.js b/src/projects.js\n--- a/src/projects.js\n+++ b/src/projects.js\n@@ -1,9 +1,15 @@\n export function getFeatured(projects) {\n-  return projects;\n+  return projects\n+    .filter(project => project.active)\n+    .sort((a, b) => b.stars - a.stars)\n+    .slice(0, 3);\n }\n \n export function formatProject(project) {\n-  return project.name;\n+  const stars = project.stars.toLocaleString();\n+  return `${project.name}: ${stars} stars`;\n }\n \n-export const theme = \"default\";\n+export const theme = \"taffy\";\n+export const options = {\n+  lineNumbers: true,\n+};"
  },
  {
    "lang": "plaintext",
    "label": "Plain text",
    "file": "notes.txt",
    "code": "PROJECT GALLERY\n===============\n\nSmall tools for expressive interfaces.\n\nFeatured projects\n-----------------\nSugar High     JavaScript     1,200 stars\nCode Garden    TypeScript       480 stars\nPaper Trail    Python           320 stars\n\nPreview settings\n----------------\nTheme:         Taffy\nLine numbers:  On\nFont size:     14 px\n\nNotes\n-----\nThis sample is intentionally plain text.\nSymbols such as <, >, and & remain readable.\nNo keywords or strings receive special treatment.\n\nChoose another language to compare highlighting."
  }
]
