document.addEventListener("DOMContentLoaded", function () {
  var editor = CodeMirror.fromTextArea(document.getElementById("code-editor"), {
    mode: "text/x-java", // Mặc định là Java
    lineNumbers: true,
    theme: "material",
    tabSize: 4,
    indentUnit: 4,
    indentWithTabs: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    extraKeys: { "Ctrl-Space": "autocomplete" }, // Thêm phím tắt cho autocomplete
    hintOptions: {
      completeSingle: false, // Không tự động chọn nếu chỉ có 1 gợi ý
      alignWithWord: true, // Căn chỉnh gợi ý với từ
      closeOnUnfocus: true, // Đóng gợi ý khi mất focus
    },
  });

  editor.setSize("100%", "100%");
  const initialCode = editor.getValue(); // Lưu nội dung ban đầu

  // Toggle Theme (Dark/Light)
  const themeToggleButton = document.getElementById("theme-toggle-button");
  if (themeToggleButton) {
    // Khởi tạo trạng thái ban đầu
    themeToggleButton.innerHTML = '<i class="fa fa-moon"></i> Dark';
    themeToggleButton.classList.add("light-mode");

    themeToggleButton.addEventListener("click", function (event) {
      event.preventDefault();
      let currentTheme = editor.getOption("theme");

      if (currentTheme === "dracula") {
        // Chuyển sang light mode
        editor.setOption("theme", "default");
        document.body.classList.add("light-theme");
        this.innerHTML = '<i class="fa fa-sun"></i> Light';
        this.classList.remove("light-mode");
      } else {
        // Chuyển sang dark mode
        editor.setOption("theme", "dracula");
        document.body.classList.remove("light-theme");
        this.innerHTML = '<i class="fa fa-moon"></i> Dark';
        this.classList.add("light-mode");
      }
    });
  }

  // Reset nội dung Editor
  const resetButton = document.getElementById("reset-button");
  if (resetButton) {
    resetButton.addEventListener("click", function (event) {
      event.preventDefault();
      editor.setValue(initialCode);
    });
  }

  // Thêm từ khóa cho các ngôn ngữ
  const keywords = {
    python: [
      "def",
      "class",
      "for",
      "while",
      "if",
      "else",
      "elif",
      "try",
      "except",
      "finally",
      "import",
      "from",
      "as",
      "return",
      "yield",
      "break",
      "continue",
      "pass",
      "raise",
      "True",
      "False",
      "None",
      "and",
      "or",
      "not",
      "is",
      "in",
      "lambda",
      "with",
      "print",
    ],

    java: [
      "public",
      "private",
      "protected",
      "class",
      "interface",
      "extends",
      "implements",
      "static",
      "final",
      "void",
      "if",
      "else",
      "for",
      "while",
      "do",
      "try",
      "catch",
      "finally",
      "throw",
      "throws",
      "new",
      "return",
      "this",
      "super",
      "import",
      "package",
      "int",
      "long",
      "float",
      "double",
      "boolean",
      "char",
      "String",
      "System.out.println",
    ],

    sql: [
      "SELECT",
      "FROM",
      "WHERE",
      "INSERT",
      "UPDATE",
      "DELETE",
      "JOIN",
      "LEFT JOIN",
      "RIGHT JOIN",
      "INNER JOIN",
      "GROUP BY",
      "HAVING",
      "ORDER BY",
      "DESC",
      "ASC",
      "CREATE TABLE",
      "ALTER TABLE",
      "DROP TABLE",
      "PRIMARY KEY",
      "FOREIGN KEY",
      "AND",
      "OR",
      "NOT",
      "NULL",
      "IS NULL",
      "IS NOT NULL",
      "LIKE",
      "IN",
      "BETWEEN",
    ],

    c: [
      "int",
      "char",
      "float",
      "double",
      "void",
      "long",
      "short",
      "signed",
      "unsigned",
      "if",
      "else",
      "for",
      "while",
      "do",
      "switch",
      "case",
      "break",
      "continue",
      "return",
      "struct",
      "union",
      "typedef",
      "sizeof",
      "printf",
      "scanf",
      "include",
      "define",
      "malloc",
      "free",
      "NULL",
      "const",
      "static",
      "extern",
      "#include",
      "#define",
    ],
  };

  // Hàm gợi ý từ khóa dựa trên ngôn ngữ hiện tại
  function getHints(cm, options) {
    const cursor = cm.getCursor();
    const line = cm.getLine(cursor.line);

    // Tìm vị trí bắt đầu của từ hiện tại
    let start = cursor.ch;
    while (start && /[\w\.]/.test(line.charAt(start - 1))) --start;

    // Lấy từ hiện tại đang gõ
    const currentWord = line.slice(start, cursor.ch).toLowerCase();

    // Chỉ hiện gợi ý khi có ít nhất 1 ký tự
    if (currentWord.length === 0) {
      return null;
    }

    const currentMode = editor.getOption("mode");
    let currentLang = "java"; // mặc định

    // Xác định ngôn ngữ hiện tại
    if (currentMode === "text/x-python") currentLang = "python";
    else if (currentMode === "text/x-java") currentLang = "java";
    else if (currentMode === "text/x-sql") currentLang = "sql";
    else if (currentMode === "text/x-csrc") currentLang = "c";

    const list = keywords[currentLang] || [];

    // Lọc các từ khóa phù hợp
    const matches = list.filter((item) =>
      item.toLowerCase().startsWith(currentWord)
    );

    // Nếu không có kết quả phù hợp, không hiện gợi ý
    if (!matches.length) {
      return null;
    }

    return {
      list: matches,
      from: CodeMirror.Pos(cursor.line, start),
      to: CodeMirror.Pos(cursor.line, cursor.ch),
    };
  }

  // Đăng ký hàm gợi ý
  CodeMirror.registerHelper("hint", "anyword", getHints);

  // Bật tự động gợi ý khi gõ
  editor.on("keyup", function (cm, event) {
    // Chỉ hiện gợi ý khi gõ chữ cái hoặc số
    const shouldComplete =
      !cm.state.completionActive && // Không có gợi ý đang hiển thị
      event.keyCode != 13 && // Không phải phím Enter
      event.keyCode != 27 && // Không phải phím Escape
      event.keyCode != 32 && // Không phải phím Space
      !/^[!@#$%^&*(),.?":{}|<>]$/.test(event.key) && // Không phải ký tự đặc biệt
      event.key.length === 1; // Là ký tự đơn

    if (shouldComplete) {
      CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
    }
  });

  // Thay đổi ngôn ngữ code
  const languageSelect = document.getElementById("language-select");
  if (languageSelect) {
    languageSelect.addEventListener("change", function () {
      let mode = "";
      switch (this.value) {
        case "python":
          mode = "text/x-python";
          break;
        case "java":
          mode = "text/x-java";
          break;
        case "sql":
          mode = "text/x-sql";
          break;
        case "c":
          mode = "text/x-csrc";
          break;
        default:
          mode = "text/x-java";
      }
      editor.setOption("mode", mode);
    });
  }

  // Submit form
  const form = document.getElementById("code-form");
  if (form) {
    form.addEventListener("submit", function () {
      editor.save(); // Đảm bảo CodeMirror lưu lại nội dung vào textarea
    });
  }

  // Xử lý nút Pre-check
  const preCheckButton = document.getElementById("precheck-button");
  if (preCheckButton) {
    preCheckButton.addEventListener("click", function () {
      runPrecheck();
    });
  }

  // Xử lý nút Clear output
  const clearButton = document.getElementById("clear-button");
  if (clearButton) {
    clearButton.addEventListener("click", function () {
      document.getElementById("output").innerHTML = "";
      console.log("Output cleared.");
    });
  }

  // Xác nhận Submit
  const confirmSubmit = document.getElementById("confirm-submit");
  if (confirmSubmit) {
    confirmSubmit.addEventListener("click", function (event) {
      let codeContent = editor.getValue();
      if (!codeContent.trim()) {
        event.preventDefault();
        $("#confirmModal").modal("hide");
        document.getElementById(
          "output"
        ).innerHTML = `<div class="alert alert-danger" role="alert">This code field is required.</div>`;
      } else {
        editor.save();
      }
    });
  }

  // Chức năng Pre-check
  function runPrecheck() {
    const code = editor.getValue();
    const language = languageSelect.value;

    fetch("/api/exercises/precheck/120", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code, language: language }),
    })
      .then((response) => response.json())
      .then((data) => {
        let outputDiv = document.getElementById("output");
        if (data.error) {
          outputDiv.innerHTML = `
                        <div class="alert alert-danger">Error: Code is formatted and structured incorrectly.</div>
                        <div class="alert alert-warning">Please fix the format and structure correctly...</div>`;
        } else {
          outputDiv.innerHTML = `<div style="background-color: #282a36 !important;">${data.combinedMessage}</div>`;
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        document.getElementById("output").innerHTML =
          "<pre>Error: Error during Pre-check</pre>";
      });
  }

  // Scroll to Top Button
  const scrollToTopButton = document.getElementById("scrollToTopButton");
  if (scrollToTopButton) {
    window.onscroll = function () {
      scrollToTopButton.style.display = window.scrollY > 100 ? "flex" : "none";
    };

    scrollToTopButton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Xử lý resize và ẩn hiện left panel
  const leftPanel = document.getElementById("leftPanel");
  const centerPanel = document.getElementById("centerPanel");
  const resizer = document.getElementById("resizer");
  const toggleBtn = document.getElementById("toggleLeftPanel");

  function updateCenterPanel() {
    if (leftPanel.style.display === "none" || leftPanel.offsetWidth === 0) {
      centerPanel.style.width = "100%";
    } else {
      centerPanel.style.width = `calc(100% - ${leftPanel.offsetWidth}px)`;
    }
  }

  if (toggleBtn) {
    let isPanelCollapsed = false;
    toggleBtn.addEventListener("click", function () {
      isPanelCollapsed = !isPanelCollapsed;
      if (isPanelCollapsed) {
        leftPanel.style.width = "0px";
        leftPanel.style.display = "none";
      } else {
        leftPanel.style.width = "450px";
        leftPanel.style.display = "block";
      }
      updateCenterPanel();
    });
  }

  if (resizer) {
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    resizer.addEventListener("mousedown", function (event) {
      isResizing = true;
      startX = event.clientX;
      startWidth = leftPanel.offsetWidth;

      document.addEventListener("mousemove", resizePanel);
      document.addEventListener("mouseup", stopResizing);
    });

    function resizePanel(event) {
      if (!isResizing) return;
      let newWidth = startWidth + (event.clientX - startX);

      if (newWidth < 200) {
        leftPanel.style.width = "200px";
      } else if (newWidth > 200 && newWidth <= 450) {
        requestAnimationFrame(() => {
          leftPanel.style.width = `${newWidth}px`;
          centerPanel.style.width = `calc(100% - ${newWidth}px)`;
        });
      }
    }

    function stopResizing() {
      isResizing = false;
      document.removeEventListener("mousemove", resizePanel);
      document.removeEventListener("mouseup", stopResizing);
    }
  }

  // Cập nhật kích thước center panel ngay từ đầu
  updateCenterPanel();

  // Thêm chức năng tìm kiếm Google
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const searchTab = document.getElementById("search-tab");
  const searchFrame = document.getElementById("searchFrame");

  function performSearch() {
    const searchQuery = searchInput.value.trim();
    if (searchQuery) {
      // Chuyển đến tab tìm kiếm
      searchTab.click();
      // Load kết quả tìm kiếm trong iframe
      searchFrame.src = `https://www.google.com/search?igu=1&q=${encodeURIComponent(
        searchQuery
      )}`;
    }
  }

  // Xử lý sự kiện click nút tìm kiếm
  searchButton.addEventListener("click", performSearch);

  // Xử lý sự kiện nhấn Enter trong ô input
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  // Xử lý sự kiện thay đổi theme
  document
    .getElementById("theme-select")
    .addEventListener("change", function () {
      const selectedTheme = this.value;
      editor.setOption("theme", selectedTheme);
    });
});
