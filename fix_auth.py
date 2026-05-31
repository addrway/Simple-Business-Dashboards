with open('src/AuthContext.js', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith('  const isAdmin = profile?.role === "admin" || profile?.is_admin === true;'):
        continue # skip the one from HEAD that wasn't part of the conflict block
    new_lines.append(line)

with open('src/AuthContext.js', 'w') as f:
    f.writelines(new_lines)
