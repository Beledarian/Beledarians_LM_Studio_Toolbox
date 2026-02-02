# Contributing to Beledarians LM Studio Toolbox

First off, thank you for considering contributing to this project! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.


## 🐛 Reporting Bugs

If you find a bug, please create an Issue on GitHub. Include:
* A clear title and description.
* Steps to reproduce the bug.
* The expected behavior vs. actual behavior.

## 🛠 Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone [https://github.com/your-username/Beledarians_LM_Studio_Toolbox.git](https://github.com/your-username/Beledarians_LM_Studio_Toolbox.git)
    cd Beledarians_LM_Studio_Toolbox
    ```
3.  **Install dependencies** (ensure you have Node.js installed):
    ```bash
    npm install
    ```

## 🔄 The Workflow (How to Submit Changes)

To keep the history clean and ensure quality, please follow this workflow:

1.  **Create a Branch:** Never work directly on `main`. Create a descriptive branch for your feature or fix:
    ```bash
    git checkout -b feature/amazing-new-tool
    # or
    git checkout -b fix/annoying-bug
    ```
2.  **Make your changes:** Write your code and ensure it follows the project's style.
3.  **Commit your changes:** Use clear, descriptive commit messages.
    ```bash
    git commit -m "feat: add token counter utility"
    ```
4.  **Push to your fork:**
    ```bash
    git push origin feature/amazing-new-tool
    ```
5.  **Open a Pull Request:** Go to the original repository and click "Compare & pull request." Provide a clear description of what you changed and why.

## 🎨 Coding Standards

Since this project uses **TypeScript**, please adhere to the following:

* **Strict Typing:** Avoid using `any` whenever possible. Define interfaces/types for your data structures.
* **Clarity:** Variable and function names should be self-explanatory.
* **Formatting:** If available, run the linter/formatter before committing.

Thank you for your contributions!
