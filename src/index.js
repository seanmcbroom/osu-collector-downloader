const { QMainWindow, QIcon } = require("@nodegui/nodegui");
const RootView = require("./components/RootView");

const win = new QMainWindow();
win.setWindowTitle("osu!collector");
win.setFixedSize(400, 200);

const icon = new QIcon("../assets/iconx200.png");
win.setWindowIcon(icon);

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
