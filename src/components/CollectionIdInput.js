const { QWidget, FlexLayout, QLabel, QLineEdit } = require("@nodegui/nodegui");

class CollectionIdInput {
    constructor() {
        this.widget = new QWidget();
        this.layout = new FlexLayout();
        this.widget.setLayout(this.layout);

        this.setupUI();
    }

    setupUI() {
        this.label = new QLabel();
        this.label.setText("Collection Id:");

        this.input = new QLineEdit();

        this.layout.addWidget(this.label);
        this.layout.addWidget(this.input);
    }

    getCollectionId() {
        return this.input.text();
    }

    getWidget() {
        return this.widget;
    }
}

module.exports = CollectionIdInput;
