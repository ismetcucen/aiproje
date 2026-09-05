import os

with open('src/components/teacher/CountdownTimer.jsx', 'r') as f:
    content = f.read()

# I did: content.replace(..., new_return)
# which created a duplicate return if the string was replaced in a weird way. Let's just fix it.
content = content.replace("return (\nreturn (", "return (")
content = content.replace("return (\n    return (", "return (")
content = content.replace("return (\n  return (", "return (")

with open('src/components/teacher/CountdownTimer.jsx', 'w') as f:
    f.write(content)
