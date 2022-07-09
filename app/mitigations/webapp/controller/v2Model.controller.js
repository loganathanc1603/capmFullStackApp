sap.ui.define([
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    function (BaseController, Filter, FilterOperator) {
        "use strict";

        return BaseController.extend("ns.mitigations.controller.v2Model", {

            onInit: function () {
                this.oDataV2Model = this.getOwnerComponent().getModel("v2");
                this.getView().setModel(this.oDataV2Model);
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
            }

        });
    });
