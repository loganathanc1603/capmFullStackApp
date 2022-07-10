sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, History, formatter, MessageBox, Fragment, MessageToast, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("ns.mitigations.controller.Object", {

		formatter: formatter,

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
			this.objectViewModel = new JSONModel({
				busy: true,
				delay: 0,
				IsFooterVisible: false,
				IsEditable: false,
				IsEditButtonVisible: true,
				IsDeleteButtonVisible: true
			});
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.setModel(this.objectViewModel, "objectView");
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */


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
				this.getRouter().navTo("worklist", {}, true);
			}
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
			this.oContextPath = oEvent.getParameter("arguments").riskId;
			this._bindView("/" + this.oContextPath);
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
						this.objectViewModel.setProperty("/busy", true);
					}.bind(this),
					dataReceived: function (oData) {
						this.objectViewModel.setProperty("/busy", false);
						if (oData.getParameter("data")) {
							let IsActiveEntity = oData.getParameter("data").IsActiveEntity;
							this.objectViewModel.setProperty("/IsFooterVisible", !IsActiveEntity);
							this.objectViewModel.setProperty("/IsEditable", !IsActiveEntity);

							this.objectViewModel.setProperty("/IsEditButtonVisible", IsActiveEntity);
							this.objectViewModel.setProperty("/IsDeleteButtonVisible", IsActiveEntity);
							if (this._getAffctedUserTable().isInitialised()) {
								this._getAffctedUserTable().rebindTable();
							}
						} else {
							this.getRouter().navTo("v2Model", {}, true);
						}
					}.bind(this)
				}
			});
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

		onCreateRisks: function () {
			this.objectViewModel.setProperty("/busy", true);
			let sPath = this.getView().getBindingContext().getPath() + "/RiskService.draftActivate";
			this.oDataV2Model.create(sPath, {}, {
				success: function (oData) {
					let sPath = this._createBindingKey(oData);
					this.objectViewModel.setProperty("/busy", false);
					MessageBox.success("The Data Created Successfully.", {
						title: "Success"
					});
					this._bindView(sPath);
				}.bind(this),
				error: function (oError) {
					this.objectViewModel.setProperty("/busy", false);
				}.bind(this)
			});
		},

		onEditRisks: function () {
			this.objectViewModel.setProperty("/busy", true);
			let sPath = this.getView().getBindingContext().getPath() + "/RiskService.draftEdit";
			let oPayload = {
				"PreserveChanges": true
			};
			this.objectViewModel.setProperty("/busy", true);
			this.oDataV2Model.create(sPath, oPayload, {
				success: function (oData) {
					let sPath = this._createBindingKey(oData);
					this.objectViewModel.setProperty("/busy", false);
					this._bindView(sPath);
				}.bind(this),
				error: function (oError) {
					this.objectViewModel.setProperty("/busy", false);
				}.bind(this)
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
					this.getRouter().navTo("v2Model", {});
				}.bind(this),
				error: function () {
					this.objectViewModel.setProperty("/busy", false);
				}.bind(this)
			})
		},

		onCancelRisks: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView();

			if (!this._pdraftCancelPopover) {
				this._pdraftCancelPopover = Fragment.load({
					id: oView.getId(),
					name: "ns.mitigations.fragments.draftCancelPopover",
					controller: this
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}
			this._pdraftCancelPopover.then(function (oPopover) {
				oPopover.openBy(oButton);
			});
		},

		onPressDiscard: function () {
			this.onDeleteRisks();
		},

		onPressAffectedUserCreatePage: function () {
			let sPath = this.getView().getBindingContext().getPath() + "/AffectedUsers ";
			this.oDataV2Model.create(sPath, {}, {
				success: (oData) => {
					let sAffPath = this.oDataV2Model.createKey("AffectedUsers", {
						ID: oData.ID,
						IsActiveEntity: oData.IsActiveEntity
					});
					this._onNavToObject(sAffPath);
				}, error: (oError) => {
					sap.m.MessageBox.error("Error");
				}
			})
		},

		_onNavToObject: function (sAffPath) {
			let sRiskPath = this.getView().getBindingContext().getPath().slice(1);
			this.getRouter().navTo("NestedObject", {
				RiskPath: sRiskPath,
				AffectUserPath: sAffPath
			});
		},

		onSelectIconTabBar: function (oEvent) {
			var sKey = oEvent.getSource().getSelectedKey();
			if (sKey === "AFFUSER") {
				this._getAffctedUserTable().rebindTable();
			}
		},

		onBeforeRebindTableAffectedUsers: function (oEvent) { },

		onPressAffectedUserDelete: function () {
			let oSelectedItems = this._getAffctedUserTable().getTable().getSelectedContextPaths();
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

		onNavigationAffectedUser: function (oEvent) {
			let sPath = oEvent.getSource().getBindingContextPath().slice(1);
			this._onNavToObject(sPath);
		},

		_getAffctedUserTable: function () {
			return this.getView().byId("idAffectedUsersSmatTable");
		},



		_createBindingKey: function (oData) {
			let sPath = this.oDataV2Model.createKey("/Risks", {
				ID: oData.ID,
				IsActiveEntity: oData.IsActiveEntity
			});
			return sPath;
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

		setDefaultTitle: function (sValue) {
			if (!sValue) {
				return "New Draft Value"
			} else {
				return sValue;
			}
		}

	});

});