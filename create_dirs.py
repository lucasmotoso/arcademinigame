#!/usr/bin/env python3
import os
import sys

# Change to the script directory
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

dirs = [
    'src',
    'src/core',
    'src/components',
    'src/games',
    'src/games/pong',
    'src/games/snake',
    'src/games/sinuca',
    'src/styles',
    'src/utils',
    'dist',
    '.vscode',
]

print("Creating directory structure...")
for dir_path in dirs:
    if not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)
        print(f'✓ Created: {dir_path}')
    else:
        print(f'✓ Already exists: {dir_path}')

# Create .gitkeep files
gitkeep_dirs = ['dist', 'src/games/pong', 'src/games/snake', 'src/games/sinuca']
for dir_path in gitkeep_dirs:
    gitkeep_path = os.path.join(dir_path, '.gitkeep')
    if not os.path.exists(gitkeep_path):
        with open(gitkeep_path, 'w') as f:
            pass
        print(f'✓ Created .gitkeep in {dir_path}')

print('\n✓ Project structure created successfully!')

# Verify structure
print('\n' + '='*50)
print('Verifying directory structure:')
print('='*50)
for root, dirs_list, files in os.walk('.'):
    # Skip hidden directories and node_modules
    dirs_list[:] = [d for d in dirs_list if not d.startswith('.') or d in ['.vscode', '.git']]
    
    level = root.replace('.', '').count(os.sep)
    indent = ' ' * 2 * level
    print(f'{indent}{os.path.basename(root)}/')
    
    subindent = ' ' * 2 * (level + 1)
    for file in sorted(files):
        if not file.startswith('.'):
            print(f'{subindent}{file}')
