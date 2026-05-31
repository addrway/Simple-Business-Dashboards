import re

def resolve_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # The user says:
    # Delete everything between <<<<<<< and ======= (that's the old main branch code)
    # Keep everything between ======= and >>>>>>> (that's our branch code with the admin bypass fix)

    # regex to keep part2
    pattern = r'<<<<<<< HEAD.*?=======\n(.*?)\n>>>>>>> origin/main'

    resolved_content = re.sub(pattern, r'\1', content, flags=re.DOTALL)

    with open(filepath, 'w') as f:
        f.write(resolved_content)

resolve_file('src/App.jsx')
resolve_file('src/AuthContext.js')
