const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let modified = false;

  // Replace `(supabase.from(...) as any)` -> `(supabase as any).from(...)`
  const regex1 = /\(supabase\.from\((['"`][^'"`]+['"`])\)\s*as\s+any\)/g;
  if (regex1.test(content)) {
    content = content.replace(regex1, '(supabase as any).from($1)');
    modified = true;
  }

  // Replace `supabase.from(...)` -> `(supabase as any).from(...)`
  // But wait, there might be `(supabase as any).from` already matching if we are not careful
  // We match exactly `supabase.from` not preceded by `)` or ` ` maybe?
  // Let's just match `supabase.from` and not `(supabase as any).from`
  const regex2 = /(?<!as any\)\.)supabase\.from\((['"`][^'"`]+['"`])\)/g;
  if (regex2.test(content)) {
    content = content.replace(regex2, '(supabase as any).from($1)');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
});
