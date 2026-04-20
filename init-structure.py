#!/usr/bin/env python3
"""
Initialize the project structure for Arcade Mini Game 2.0
"""

import os
import sys

def create_project_structure():
    """Create the complete project directory structure"""
    
    directories = [
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
    
    base_path = os.path.dirname(os.path.abspath(__file__))
    
    for directory in directories:
        full_path = os.path.join(base_path, directory)
        os.makedirs(full_path, exist_ok=True)
        print(f"✓ Created: {directory}")
    
    # Create .gitkeep files in empty directories
    gitkeep_dirs = [
        'dist',
        'src/games/pong',
        'src/games/snake',
        'src/games/sinuca',
    ]
    
    for directory in gitkeep_dirs:
        gitkeep_path = os.path.join(base_path, directory, '.gitkeep')
        with open(gitkeep_path, 'w') as f:
            f.write('')
    
    print("\n✓ Project structure initialized successfully!")
    return True

if __name__ == '__main__':
    try:
        create_project_structure()
        sys.exit(0)
    except Exception as e:
        print(f"✗ Error: {e}")
        sys.exit(1)
