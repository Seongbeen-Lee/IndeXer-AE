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
  var activeSequence = app.project.activeSequence;

  if (activeSequence) {
    for (var i = 0; i < activeSequence.audioTracks.numTracks; i++) {
      var track = activeSequence.audioTracks[i];
      for (var j = 0; j < track.clips.numItems; j++) {
        var clip = track.clips[j];
        var title = removeFileExtension(clip.name);
        var startTime = formatTimecode(clip.start.seconds);
        audioSequences.push({ timecode: startTime, title: title });
      }
    }
  } else {
    alert("Please select a sequence.");
    return;
  }

  // Save data to a file
  if (audioSequences.length > 0) {
    // Create a custom dialog to choose the file format
    var dlg = new Window("dialog", "IndeXer BETA");
    dlg.orientation = "column";
    dlg.alignChildren = "center";

    dlg.add("statictext", undefined, "Data Preview:");
    var listBox = dlg.add("listbox", [0, 0, 400, 300]);
    for (var j = 0; j < audioSequences.length; j++) {
      var item = listBox.add(
        "item",
        audioSequences[j].timecode + " " + audioSequences[j].title
      );
    }

    dlg.add("statictext", undefined, "Choose file format:");
    var formatGroup = dlg.add("group");
    formatGroup.orientation = "row";
    formatGroup.add("statictext", undefined, "File format:");
    var radioGroup = formatGroup.add("group");
    radioGroup.orientation = "row";
    var txtRadio = radioGroup.add("radiobutton", undefined, "Text (.txt)");
    var jsonRadio = radioGroup.add("radiobutton", undefined, "JSON (.json)");
    txtRadio.value = true;

    var buttonGroup = dlg.add("group");
    buttonGroup.orientation = "row";
    var okButton = buttonGroup.add("button", undefined, "OK");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");
    buttonGroup.alignment = ["right", "bottom"];

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
          ? JSON.stringify(audioSequences)
          : createTextFile(audioSequences);
        outputFile.open("w");
        outputFile.write(outputText);
        outputFile.close();
        alert("File saved to " + outputFile.fullName + "!");
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
      var outputFile = File.saveDialog("Save Audio Sequence Data", fileFilter);

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
        alert("Data saved successfully!");
      } else {
        alert("File saving cancelled.");
      }
    } else {
      alert("File format selection cancelled.");
    }
  } else {
    alert("선택한 컴포지션에서 오디오 시퀀스를 찾을 수 없어요.");
  }
})();
