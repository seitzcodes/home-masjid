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

  // Match: supabase \n .from("...")
  // We can just globally replace `supabase[\s\n]*\.from\(` with `(supabase as any).from(`
  // except we need to make sure we don't double replace `(supabase as any).from`.
  // The simplest is to replace `supabase\s*\.\s*from\(` with `(supabase as any).from(`
  // but only if it's not preceded by `as any)`.
  const regex = /(?<!as any\)\s*)supabase\s*\.\s*from\((['"`][^'"`]+['"`])\)/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, '(supabase as any).from($1)');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
});
