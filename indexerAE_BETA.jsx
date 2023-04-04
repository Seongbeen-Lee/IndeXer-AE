// Create an After Effects Script to get audio sequence information and save it to a file
(function () {
  // Function to format timecode
  function formatTimecode(time) {
    var hours = Math.floor(time / 3600);
    var minutes = Math.floor((time % 3600) / 60);
    var seconds = Math.floor(time % 60);
    if (hours === 0) {
      return minutes + ":" + ("0" + seconds).slice(-2);
    } else {
      return (
        hours +
        ":" +
        ("0" + minutes).slice(-2) +
        ":" +
        ("0" + seconds).slice(-2)
      );
    }
  }

  // Function to remove file extension
  function removeFileExtension(filename) {
    var lastDot = filename.lastIndexOf(".");
    return lastDot === -1 ? filename : filename.substring(0, lastDot);
  }

  // Function to create text file content
  function createTextFile(items) {
    var text = "";
    for (var i = 0; i < items.length; i++) {
      text += items[i].timecode + " " + items[i].title + "\n";
    }
    return text;
  }

  // Get audio sequence data
  var audioSequences = [];
  var comp = app.project.activeItem;

  if (comp && comp instanceof CompItem) {
    for (var i = 1; i <= comp.numLayers; i++) {
      var layer = comp.layer(i);
      if (layer.hasAudio && layer.audioEnabled) {
        var title = removeFileExtension(layer.name);
        var startTime = formatTimecode(layer.inPoint); // modified line
        audioSequences.push({ timecode: startTime, title: title });
      }
    }
  } else {
    alert("Please select a composition.");
    return;
  }

  // Save data to a file
  if (audioSequences.length > 0) {
    // Create a custom dialog to choose the file format
    var dlg = new Window("dialog", "IndeXer BETA");
    dlg.orientation = "column";
    dlg.alignChildren = "center";

    // dlg.add("statictext", undefined, "데이터 미리보기:");
    var listBox = dlg.add("listbox", [0, 0, 400, 300]);
    for (var j = 0; j < audioSequences.length; j++) {
      var item = listBox.add(
        "item",
        audioSequences[j].timecode + " " + audioSequences[j].title
      );
    }

    // dlg.add("statictext", undefined, "파일 형식을 지정해주세요:");
    var formatGroup = dlg.add("group");
    formatGroup.orientation = "row";
    formatGroup.add("statictext", undefined, "파일 형식:");
    var radioGroup = formatGroup.add("group");
    radioGroup.orientation = "row";
    var txtRadio = radioGroup.add("radiobutton", undefined, "Text (.txt)");
    var jsonRadio = radioGroup.add("radiobutton", undefined, "JSON (.json)");
    txtRadio.value = true;

    var buttonGroup = dlg.add("group");
    buttonGroup.orientation = "row";
    var okButton = buttonGroup.add("button", undefined, "확인");
    var cancelButton = buttonGroup.add("button", undefined, "취소");
    buttonGroup.alignment = ["right", "bottom"];

    // Add created by text
    var createdByText = dlg.add(
      "statictext",
      undefined,
      "created by Seongbeen Lee / dltjdqls@icloud.com"
    );
    createdByText.alignment = ["center", "bottom"];

    // Button callbacks
    okButton.onClick = function () {
      var extension = jsonRadio.value ? "json" : "txt";
      var fileFilter = "*." + extension;
      var outputFile = File.saveDialog("Save as", fileFilter);

      if (outputFile) {
        // Append the chosen extension if it's not already there
        var fileExtensionRegex = new RegExp("\\." + extension + "$", "i");
        if (!fileExtensionRegex.test(outputFile.name)) {
          outputFile = new File(outputFile.fsName + "." + extension);
        }

        var outputText = jsonRadio.value
          ? JSON.stringify(audioSequences, null, 2) // modified line
          : createTextFile(audioSequences);
        outputFile.open("w");
        outputFile.write(outputText);
        outputFile.close();
        alert("파일이 " + outputFile.fullName + "에 저장되었어요!");
      }
    };

    cancelButton.onClick = function () {
      dlg.close();
    };

    // Show the dialog
    if (dlg.show() === 1) {
      var fileExtension = jsonRadio.value ? "json" : "txt";
      var fileFilter =
        fileExtension.toUpperCase() + " file: *." + fileExtension;
      var outputFile = File.saveDialog(
        "오디오 시퀀스 데이터 저장:",
        fileFilter
      );

      if (outputFile) {
        // Append the chosen extension if it's not already there
        var fileExtensionRegex = new RegExp("\\." + fileExtension + "$", "i");
        if (!fileExtensionRegex.test(outputFile.name)) {
          outputFile = new File(outputFile.fsName + "." + fileExtension);
        }

        outputFile.open("w");

        if (fileExtension === "json") {
          outputFile.write(JSON.stringify(audioSequences, null, 2));
        } else {
          for (var k = 0; k < audioSequences.length; k++) {
            var timecode = audioSequences[k].timecode;
            // if (deleteHoursCheckbox.value) {
            //   timecode = timecode.substring(timecode.indexOf(":") + 1);
            // }
            outputFile.writeln(timecode + " " + audioSequences[k].title);
          }
        }

        outputFile.close();
        alert("데이터가 성공적으로 저장되었어요!");
      } else {
        alert("파일 저장이 취소되었어요.");
      }
    } else {
      alert("파일 형식 선택이 취소되었어요.");
    }
  } else {
    alert("선택한 컴포지션에서 오디오 시퀀스를 찾을 수 없어요.");
  }
})();
