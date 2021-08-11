sap.ui.define("products.ext.controller.ListReportExt",
    [],
    function () {
        "use strict";
        return {
            onClose: function (oEvent) {
                this.byId("helloDialog").close();
                this.byId("helloDialog").destroy();
                this.getView().removeAllDependents();
            },

            onAccept: function (oEvent) {
                sap.m.MessageToast.show("Consumindo Serviço e atualizando dados...", {
                    duration: 6000
                });
                this.templateBaseExtension.getExtensionAPI().refreshTable();
                this.onClose();
            },

            onCsvClick: function (oEvent) {
                let oView = this.getView();
                let oDialog = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "products.ext.view.fragment.upload",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });

                oDialog.then(function (oDialog) { oDialog.open() });
            },

            onAddedItem: function (oEvent) {
                this.getView().byId("pnlUpload").setVisible(false);
                let oFile = oEvent.getParameter("item").getFileObject();
                if (oFile) {
                    var reader = new FileReader();
                    reader.onload = function (evt) {
                        this.csvJSON(evt.target.result);
                    }.bind(this);
                    reader.readAsText(oFile);
                }
            },

            csvJSON: function (csv) {
                let lines = csv.split("\n");
                let result = [];
                let headers = lines[1].split(";");
                for (let i = 2; i < lines.length; i++) {
                    let obj = {};
                    let currentline = lines[i].split(";");
                    for (let j = 0; j < headers.length; j++) {
                        obj[headers[j]] = currentline[j];
                    }
                    result.push(obj);
                }
                let oStringResult = JSON.stringify(result);
                let oFinalResult = JSON.parse(oStringResult.replace(/\\r/g, ""));

                this.buildTable(lines[0].split(";")[0], oFinalResult);
            },

            buildTable: function (sSource, oModel) {
                let oPanel = this.getView().byId("pnlTable");
                oPanel.setHeaderText("Tabela: " + sSource);
                oPanel.setVisible(true);
                let oTable = this.getView().byId("idTable");
                let aTemplate = [];

                for (let [key, value] of Object.entries(oModel[1])) {
                    oTable.addColumn(new sap.m.Column({ header: new sap.m.Label({ text: key }) }));
                    aTemplate.push(new sap.m.Text({ text: "{" + key + "}" }))
                }

                oTable.setModel(new sap.ui.model.json.JSONModel(oModel));
                oTable.bindAggregation("items", { path: "/", template: new sap.m.ColumnListItem({ cells: aTemplate }) });
            }
        }

    });
