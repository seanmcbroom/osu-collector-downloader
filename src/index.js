const { QMainWindow, QIcon, QSystemTrayIcon } = require("@nodegui/nodegui");
const Path = require("path");
const RootView = require("./components/RootView");

const win = new QMainWindow();
win.setWindowTitle("osu!collector downloader");
win.setFixedSize(400, 200);

const tray = new QSystemTrayIcon();

const icon = new QIcon(
  Path.join(__dirname, "./assets/logo.png")
);

win.setWindowIcon(icon);
tray.setIcon(icon);
tray.show();

global.tray = tray; // prevents garbage collection of tray

// Set up the root view
const rootView = new RootView();
win.setCentralWidget(rootView.getWidget());

// Apply the stylesheet to the root view
const styleSheet = `
  #rootView {
    padding: 10px;
  }

  #downloadStatus {
    margin-top: 10px;
    width: 100%;
    color: #427cff;
  }

  #directorySelectorLabel {
    color: #333333;
  }

  #downloadButton, #browseButton {
    background-color: #4CAF50;
    color: white;
    padding: 5px 15px;
    border-radius: 3px;
  }

  #fieldset {
    padding: 10px;
    border: 2px solid #bdbdbd;
  }
`;

rootView.getWidget().setObjectName("rootView");
rootView.getWidget().setStyleSheet(styleSheet);

win.show();

global.win = win;
