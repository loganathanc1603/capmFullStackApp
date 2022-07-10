sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, History, formatter, MessageBox, Fragment, MessageToast) {
    "use strict";

    return BaseController.extend("ns.mitigations.controller.NestedObject", {


        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page shows busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            this.NestedObjectViewModel = new JSONModel({
                busy: false,
                delay: 0,
                IsFooterVisible: false,
                IsEditable: false,
                IsEditButtonVisible: true,
                IsDeleteButtonVisible: true
            });
            this.getRouter().getRoute("NestedObject").attachPatternMatched(this._onObjectMatched, this);
            this.setModel(this.NestedObjectViewModel, "NestedObjectView");
        },


        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Binds the view to the object path.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched: function (oEvent) {
            this.oDataV2Model = this.getOwnerComponent().getModel();
            this.oContextPath = "/" + oEvent.getParameter("arguments").RiskPath;
            this.sDeepPath = "/" + oEvent.getParameter("arguments").AffectUserPath;
            this._bindView(this.oContextPath + this.sDeepPath);
        },

        onChangeSmartField: function (oEvent) {
            let hasPendingChanges = this.oDataV2Model.hasPendingChanges();
            this.getView().byId("idDraftIndicator").setState("Saving");
            if (hasPendingChanges) {
                this.oDataV2Model.submitChanges({ 
                    success: function (oData) {
                        this.getView().byId("idDraftIndicator").setState("Saved");
                    }.bind(this),
                    error: function (oError) { }
                });
            }
        },

        /**
         * Binds the view to the object path.
         * @function
         * @param {string} sObjectPath path to the object to be bound
         * @private
         */
        _bindView: function (sObjectPath) {
            this.oDataV2Model.invalidateEntry(sObjectPath);
            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    dataRequested: function () {
                        this.NestedObjectViewModel.setProperty("/busy", true);
                    }.bind(this),
                    dataReceived: function (oData) {
                        this.NestedObjectViewModel.setProperty("/busy", false);
                        if (oData.getParameter("data")) {
                            let IsActiveEntity = oData.getParameter("data").IsActiveEntity;
                            this.NestedObjectViewModel.setProperty("/IsFooterVisible", !IsActiveEntity);
                            this.NestedObjectViewModel.setProperty("/IsEditable", !IsActiveEntity);

                            this.NestedObjectViewModel.setProperty("/IsEditButtonVisible", IsActiveEntity);
                            this.NestedObjectViewModel.setProperty("/IsDeleteButtonVisible", IsActiveEntity);
                        }
                    }.bind(this)
                }
            });
        },

        onDeleteRisks: function () {
			this.objectViewModel.setProperty("/busy", true);
			let sPath = this.getView().getBindingContext().getPath();
			this.oDataV2Model.remove(sPath, {
				success: function (oData) {
					this.objectViewModel.setProperty("/busy", false);
					MessageToast.show("The record deleted successfully.", {
						duration: 5000,
					})
					this.getRouter().navTo("v2Model", {}, true);
				}.bind(this),
				error: function () {
					this.objectViewModel.setProperty("/busy", false);
				}.bind(this)
			})
		},

        onPressApplyAction: function(){
            this.onNavBack();
        },

        /**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				// eslint-disable-next-line sap-no-history-manipulation
				history.go(-1);
			} else {
				this.getRouter().navTo("v2Model", {}, true);
			}
		},


        _createBindingKey: function (oData) {
            let sPath = this.oDataV2Model.createKey("/Risks", {
                ID: oData.ID,
                IsActiveEntity: oData.IsActiveEntity
            });
            return sPath;
        },

        setDefaultTitle: function (sValue) {
            if (!sValue) {
                return "New Draft Value"
            } else {
                return sValue;
            }
        }
    });
});
