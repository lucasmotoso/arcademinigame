import subprocess
import os

os.chdir(r'C:\Users\Lucas\Downloads\arcademinigame')

# List of directories to create
dirs = [
    'src',
    'src\\core',
    'src\\components',
    'src\\games',
    'src\\games\\pong',
    'src\\games\\snake',
    'src\\games\\sinuca',
    'src\\styles',
    'src\\utils',
    'dist',
    '.vscode'
]

# Create directories
for d in dirs:
    if not os.path.exists(d):
        os.makedirs(d, exist_ok=True)
        print(f'✓ Created: {d}')
    else:
        print(f'✓ Already exists: {d}')

# Create .gitkeep files
gitkeep_dirs = ['dist', 'src\\games\\pong', 'src\\games\\snake', 'src\\games\\sinuca']
for d in gitkeep_dirs:
    gitkeep = os.path.join(d, '.gitkeep')
    if not os.path.exists(gitkeep):
        open(gitkeep, 'w').close()
        print(f'✓ Created .gitkeep in {d}')

print('\n✓ Project structure created successfully!')

# List the structure
print('\n' + '='*60)
print('Directory structure:')
print('='*60)

for root, directories, files in os.walk('.'):
    # Skip certain directories
    skip_dirs = ['.git', '__pycache__', '.', 'node_modules', 'Pong', 'Snake', 'Sinuca', 'assets', 'images']
    directories[:] = [d for d in directories if d not in skip_dirs]
    
    level = root.replace('.', '').count(os.sep)
    indent = '  ' * level
    print(f'{indent}{os.path.basename(root)}/')
    
    subindent = '  ' * (level + 1)
    for d in sorted(directories):
        if d not in skip_dirs:
            print(f'{subindent}{d}/')
