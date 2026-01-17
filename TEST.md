# ===============================
# User profile configuration
# ===============================

# Basic user information (Key-value pairs)
user:
  name: Vicky Li              # Full name
  role: AI Engineer           # Current role
  location: London, UK        # Location

# Experience details
experience:
  years: 3                    # Years of experience
  focus_areas:                # Key areas of focus (List Arrays)
    - AI Testing              # Nested objects (indentation matters!)
    - Model Evaluation
    - Python for AI

# Tools and technologies used
tools:
  - Python                    # Programming language
  - Jupyter                   # Notebook environment
  - VS Code                   # Code editor
  - GitHub                    # Version control

# UI / visualization settings
colors:
  - name: red                 # Color name
    hex: "#ff0000"            # Hex code (quoted to avoid ambiguity)
  - name: blue
    hex: "#0000ff"
  - name: green
    hex: "#00ff00"
    labels:
     - experimental
     - accessibility

# Learning & certifications
learning:
  current:
    - AI Python for Beginners (DeepLearning.AI)
    - GenAI Validation Frameworks
  planned:
    - Azure AI Engineer Associate
    - LLM Evaluation & Safety

# Preferences
preferences:
  work_style: structured      # structured / flexible
  documentation: true         # Enable documentation
  automation_level: high      # low / medium / high

# Contact settings
contact:
  email: vicky@example.com
  notifications: true


  # this has been edited +++++++
  +test test one more # trigger workflow
