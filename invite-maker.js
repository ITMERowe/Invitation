const resultDiv = document.getElementById("result");
    const linkCount = document.getElementById("linkCount");

    const inputModeButton = document.getElementById("inputModeButton");
    const importModeButton = document.getElementById("importModeButton");
    const inputPanel = document.getElementById("inputPanel");
    const importPanel = document.getElementById("importPanel");

    const allowedTypes = ["family", "friends", "general", "work"];
    const baseInvitationUrl = "https://itmerowe.github.io/Invitation/";

    let generatedLinks = [];
    let currentInviteType = "general";

    function setMode(mode) {
      if (mode === "input") {
        inputModeButton.classList.add("active");
        importModeButton.classList.remove("active");
        inputPanel.classList.add("active");
        importPanel.classList.remove("active");

        const textarea = document.getElementById("manualNames");
        autoResizeTextarea(textarea);
      } else {
        inputModeButton.classList.remove("active");
        importModeButton.classList.add("active");
        inputPanel.classList.remove("active");
        importPanel.classList.add("active");
      }
    }

    function autoResizeTextarea(textarea) {
      if (!textarea) return;

      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }

    function getUrlType() {
      const params = new URLSearchParams(window.location.search);
      const type = (params.get("type") || "").trim().toLowerCase();

      if (allowedTypes.includes(type)) {
        return type;
      }

      return "general";
    }

    function setInitialType() {
      currentInviteType = getUrlType();
    }

    function makeInviteLink(type, name) {
      return (
        baseInvitationUrl +
        "?type=" +
        encodeURIComponent(type) +
        "&to=" +
        encodeURIComponent(name)
      );
    }

    function cleanName(name) {
      return String(name)
        .replace(/^"|"$/g, "")
        .replace(/^'|'$/g, "")
        .trim();
    }

    function generateLinks(names) {
      const cleanNames = names
        .map(cleanName)
        .filter(name => name.length > 0);

      cleanNames.forEach(name => {
        const link = makeInviteLink(currentInviteType, name);

        generatedLinks.push({
          type: currentInviteType,
          name: name,
          link: link
        });
      });

      renderLinks();
    }

    function generateFromManual() {
      const manualText = document.getElementById("manualNames").value;
      const names = manualText.split(/\r?\n/);

      generateLinks(names);
    }

    function renderLinks() {
      resultDiv.innerHTML = "";

      if (generatedLinks.length === 0) {
        resultDiv.innerHTML = '<div class="empty-state">No links yet.</div>';
        linkCount.textContent = "0";
        return;
      }

      generatedLinks.forEach(item => {
        const wrapper = document.createElement("div");
        wrapper.className = "link-item";

        const textWrapper = document.createElement("div");

        const nameText = document.createElement("div");
        nameText.className = "link-name";
        nameText.textContent = item.name;

        const urlText = document.createElement("div");
        urlText.className = "link-url";
        urlText.textContent = item.link;

        const copyButton = document.createElement("button");
        copyButton.className = "copy-btn";
        copyButton.textContent = "Copy";
        copyButton.onclick = function () {
          copyText(item.link, copyButton);
        };

        textWrapper.appendChild(nameText);
        textWrapper.appendChild(urlText);

        wrapper.appendChild(textWrapper);
        wrapper.appendChild(copyButton);
        resultDiv.appendChild(wrapper);
      });

      linkCount.textContent = generatedLinks.length;
    }

    function importFile() {
      const fileInput = document.getElementById("dataFile");
      const file = fileInput.files[0];

      if (!file) {
        alert("Please select a CSV, XLS, or XLSX file first.");
        return;
      }

      const fileName = file.name.toLowerCase();

      if (fileName.endsWith(".csv")) {
        importCSV(file);
      } else if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx")) {
        importExcel(file);
      } else {
        alert("Unsupported file type. Please use CSV, XLS, or XLSX.");
      }
    }

    function importCSV(file) {
      const reader = new FileReader();

      reader.onload = function (event) {
        const csvText = event.target.result;
        const names = parseCSVNames(csvText);

        if (names.length === 0) {
          alert("No names found in CSV.");
          return;
        }

        generateLinks(names);
      };

      reader.readAsText(file);
    }

    function importExcel(file) {
      const reader = new FileReader();

      reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        let sheetName = workbook.SheetNames[0];

        const preferredSheet = workbook.SheetNames.find(name =>
          name.toLowerCase().trim() === "daftar undangan"
        );

        if (preferredSheet) {
          sheetName = preferredSheet;
        }

        const worksheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: ""
        });

        const names = parseExcelNames(rows);

        if (names.length === 0) {
          alert("No names found in Excel file.");
          return;
        }

        generateLinks(names);
      };

      reader.readAsArrayBuffer(file);
    }

    function parseCSVNames(csvText) {
      const lines = csvText
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length === 0) {
        return [];
      }

      const firstRow = splitCSVLine(lines[0]);
      const lowerHeader = firstRow.map(col => col.toLowerCase().trim());

      let nameColumnIndex = 0;
      let startRow = 0;

      if (lowerHeader.includes("name")) {
        nameColumnIndex = lowerHeader.indexOf("name");
        startRow = 1;
      }

      const names = [];

      for (let i = startRow; i < lines.length; i++) {
        const columns = splitCSVLine(lines[i]);

        if (columns[nameColumnIndex]) {
          names.push(columns[nameColumnIndex]);
        }
      }

      return names;
    }

    function parseExcelNames(rows) {
      if (!rows || rows.length === 0) {
        return [];
      }

      const firstRow = rows[0].map(cell =>
        String(cell).toLowerCase().trim()
      );

      let nameColumnIndex = 0;
      let startRow = 0;

      if (firstRow.includes("name")) {
        nameColumnIndex = firstRow.indexOf("name");
        startRow = 1;
      } else {
        nameColumnIndex = findBestNameColumn(rows);
        startRow = 0;
      }

      const names = [];

      for (let i = startRow; i < rows.length; i++) {
        const row = rows[i];
        const value = row[nameColumnIndex];

        if (value !== undefined && value !== null && String(value).trim() !== "") {
          names.push(String(value).trim());
        }
      }

      return names;
    }

    function findBestNameColumn(rows) {
      let bestColumnIndex = 0;
      let bestColumnCount = 0;

      const maxColumns = Math.max(...rows.map(row => row.length), 1);

      for (let col = 0; col < maxColumns; col++) {
        let count = 0;

        for (let row = 0; row < rows.length; row++) {
          const value = rows[row][col];

          if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
          ) {
            count++;
          }
        }

        if (count > bestColumnCount) {
          bestColumnCount = count;
          bestColumnIndex = col;
        }
      }

      return bestColumnIndex;
    }

    function splitCSVLine(line) {
      const result = [];
      let current = "";
      let insideQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }

      result.push(current.trim());
      return result;
    }

    async function copyText(text, button) {
      const originalText = button ? button.textContent : "";

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const tempInput = document.createElement("textarea");
          tempInput.value = text;
          tempInput.setAttribute("readonly", "");
          tempInput.style.position = "fixed";
          tempInput.style.opacity = "0";
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand("copy");
          document.body.removeChild(tempInput);
        }

        if (button) {
          button.textContent = "Copied";
          setTimeout(() => {
            button.textContent = originalText;
          }, 1200);
        }
      } catch (error) {
        console.warn("Copy failed:", error);

        if (button) {
          button.textContent = "Failed";
          setTimeout(() => {
            button.textContent = originalText;
          }, 1200);
        }
      }
    }

    function copyAllLinks() {
      if (generatedLinks.length === 0) {
        alert("No links to copy.");
        return;
      }

      const allLinks = generatedLinks.map(item => item.link).join("\n");

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(allLinks).then(function () {
          alert("All links copied!");
        });
      } else {
        const tempInput = document.createElement("textarea");
        tempInput.value = allLinks;
        tempInput.setAttribute("readonly", "");
        tempInput.style.position = "fixed";
        tempInput.style.opacity = "0";
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        alert("All links copied!");
      }
    }

    function downloadXLSX() {
      if (generatedLinks.length === 0) {
        alert("No links to download.");
        return;
      }

      const worksheetData = [
        ["type", "name", "link"]
      ];

      generatedLinks.forEach(item => {
        worksheetData.push([
          item.type,
          item.name,
          item.link
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      worksheet["!cols"] = [
        { wch: 15 },
        { wch: 32 },
        { wch: 90 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Invite Links");

      XLSX.writeFile(workbook, "invite-links.xlsx");
    }

    function clearManual() {
      const textarea = document.getElementById("manualNames");
      textarea.value = "";
      autoResizeTextarea(textarea);
    }

    function clearResults() {
      generatedLinks = [];
      renderLinks();
    }

    window.addEventListener("load", function () {
      const textarea = document.getElementById("manualNames");
      autoResizeTextarea(textarea);
    });

    setInitialType();
    renderLinks();
