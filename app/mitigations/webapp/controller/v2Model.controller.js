sap.ui.define([
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    function (BaseController, Filter, FilterOperator) {
        "use strict";

        return BaseController.extend("ns.mitigations.controller.v2Model", {

            onInit: function () {
                this.oDataV2Model = this.getOwnerComponent().getModel();
             //   this.getView().setModel(this.oDataV2Model);
            },

            onBeforeRebindTableRisks: function (oEvent) {
                let oBindingParams = oEvent.getParameter("bindingParams"),
                    oIsDraftFilter = new Filter("IsActiveEntity", FilterOperator.EQ, false),
                    oHasNoDraftSiblingFilter = new Filter("SiblingEntity/IsActiveEntity", FilterOperator.EQ, null);

                oBindingParams.filters = [
                    new Filter({
                        filters: [oIsDraftFilter, oHasNoDraftSiblingFilter]
                    }, false)
                ];
            },

            onPressRiskCreatePage: function () {
                let sPath = "/Risks"
                this.oDataV2Model.create(sPath, {}, {
                    success: function (oData) {
                        let sPath = this.oDataV2Model.createKey("Risks", {
                            ID: oData.ID,
                            IsActiveEntity: oData.IsActiveEntity
                        });
                        this._onNavToObject(sPath);
                    }.bind(this), error: function (oError) {
                        sap.m.MessageBox.error("Error");
                    }
                })
            },

            onNavigationRisks: function (oEvent) {
                let sPath = oEvent.getSource().getBindingContextPath().slice(1);
                this._onNavToObject(sPath);
            },

            onPressRiskDelete: function(){
                let oSelectedItems = this._getRisksTable().getTable().getSelectedContextPaths();
                if (oSelectedItems.length > 0) {
                    oSelectedItems.forEach((oValue) => {
                        this.oDataV2Model.remove(oValue, {
                            success: (() => { }),
                            error: (() => { }) 
                        })
                    });
    
                    this.oDataV2Model.submitChanges({
                        success: (() => {
                            sap.m.MessageToast.show("Item deleted successfully.");
                        }),
                        error: (() => {
                            sap.m.MessageToast.show("Item deletion failed.");
                        })
                    })
                } else {
                    sap.m.MessageToast.show("Please select atlest one item to delete.");
                }
            },

            _onNavToObject: function (sPath) {
                this.getRouter().navTo("object", {
                    riskId: sPath
                });
            },

            formatRowHighlight: function (sValue1, sValue2) {
                if (!sValue1) {
                    return "Information";
                } else if (sValue2) {
                    return "Information";
                } else {
                    return "None";
                }
            },

            _getRisksTable: function(){
                return this.getView().byId("idSmartTableRisks");
            }

        });
    });
