import os

with open('src/pages/student/StudentPanel.jsx', 'r') as f:
    content = f.read()

state_inject = """  const [active, setActive]                     = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)"""

content = content.replace("  const [active, setActive]                     = useState('home')", state_inject)

with open('src/pages/student/StudentPanel.jsx', 'w') as f:
    f.write(content)
