sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/FilterType",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
  ],
  function (
    BaseController,
    JSONModel,
    formatter,
    Filter,
    FilterOperator,
    Fragment,
    MessageToast,
    FilterType,
    Sorter,
    MessageBox
  ) {
    "use strict";

    return BaseController.extend("ns.mitigations.controller.Worklist", {
      formatter: formatter,

      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * Called when the worklist controller is instantiated.
       * @public
       */
      onInit: function () {
        var oViewModel;

        // keeps the search state
        this._aTableSearchState = [];

        // Model used to manipulate control states
        oViewModel = new JSONModel({
          worklistTableTitle:
            this.getResourceBundle().getText("worklistTableTitle"),
          tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
          busy: false,
          hasUIChanges: false,
          usernameEmpty: true,
          order: 0,
        });
        this.setModel(oViewModel, "worklistView");
      },

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */

      /**
       * Triggered by the table's 'updateFinished' event: after new table
       * data is available, this handler method updates the table counter.
       * This should only happen if the update was successful, which is
       * why this handler is attached to 'updateFinished' and not to the
       * table's list binding's 'dataReceived' method.
       * @param {sap.ui.base.Event} oEvent the update finished event
       * @public
       */
      onUpdateFinished: function (oEvent) {
        // update the worklist's object counter after the table update
        var sTitle,
          oTable = oEvent.getSource(),
          iTotalItems = oEvent.getParameter("total");
        // only update the counter if the length is final and
        // the table is not empty
        if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
          sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [
            iTotalItems,
          ]);
        } else {
          sTitle = this.getResourceBundle().getText("worklistTableTitle");
        }
        this.getModel("worklistView").setProperty(
          "/worklistTableTitle",
          sTitle
        );
      },

      /**
       * Event handler when a table item gets pressed
       * @param {sap.ui.base.Event} oEvent the table selectionChange event
       * @public
       */
      onPress: function (oEvent) {
        // The source is the list item that got pressed
        this._showObject(oEvent.getSource());
      },

      /**
       * Event handler for navigating back.
       * Navigate back in the browser history
       * @public
       */
      onNavBack: function () {
        // eslint-disable-next-line sap-no-history-manipulation
        history.go(-1);
      },

      /**
       * Search for the term in the search field.
       */
      onSearch: function () {
        var oView = this.getView(),
          sValue = oView.byId("searchField").getValue(),
          oFilter = new Filter("description", FilterOperator.Contains, sValue);

        oView
          .byId("table")
          .getBinding("items")
          .filter(oFilter, FilterType.Application);
      },

      onSearchRemoved: function (oEvent) {
        if (oEvent.getParameters().refreshButtonPressed) {
          // Search field's 'refresh' button has been pressed.
          // This is visible if you select any master list item.
          // In this case no new search is triggered, we only
          // refresh the list binding.
          this.onRefresh();
        } else {
          var aTableSearchState = [];
          var sQuery = oEvent.getParameter("query");

          if (sQuery && sQuery.length > 0) {
            aTableSearchState = [
              new Filter("ID", FilterOperator.Contains, sQuery),
            ];
          }
          this._applySearch(aTableSearchState);
        }
      },

      /**
       * Event handler for refresh event. Keeps filter, sort
       * and group settings and refreshes the list binding.
       * @public
       */
      // onRefresh: function () {
      //   var oTable = this.byId("table");
      //   oTable.getBinding("items").refresh();
      // },

      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */

      /**
       * Shows the selected item on the object page
       * On phones a additional history entry is created
       * @param {sap.m.ObjectListItem} oItem selected Item
       * @private
       */
      _showObject: function (oItem) {
        var that = this;

        oItem
          .getBindingContext()
          .requestCanonicalPath()
          .then(function (sObjectPath) {
            that.getRouter().navTo("object", {
              objectId_Old: oItem.getBindingContext().getProperty("ID"),
              objectId: sObjectPath.slice("/Mitigations".length), // /Products(3)->(3)
            });
          });
      },

      /**
       * Internal helper method to apply both filter and search state together on the list binding
       * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
       * @private
       */
      _applySearch: function (aTableSearchState) {
        var oTable = this.byId("table"),
          oViewModel = this.getModel("worklistView");
        oTable.getBinding("items").filter(aTableSearchState, "Application");
        // changes the noDataText of the list in case there are no filter results
        if (aTableSearchState.length !== 0) {
          oViewModel.setProperty(
            "/tableNoDataText",
            this.getResourceBundle().getText("worklistNoDataWithSearchText")
          );
        }
      },

      onPressAdd: function (oEvent) {
        this.onOpenDialog();
      },

      onOpenDialog: function () {
        var oView = this.getView();
        // create dialog lazily
        if (!this.pDialog) {
          this.pDialog = Fragment.load({
            id: oView.getId(),
            name: "ns.mitigations.fragments.AddNew",
            controller: this,
          }).then(function (oDialog) {
            // connect dialog to the root view of this component (models, lifecycle)
            oView.addDependent(oDialog, this);
            return oDialog;
          });
        }
        this.pDialog.then(function (oDialog) {
          oDialog.open();
        });
      },

      onPressClose: function () {
        this.pDialog.then(function (oDialog) {
          oDialog.close();
        });
      },

      onPressAddNewItem: function () {
        var oPayload = {
            description: this.byId("ID_IP_DESC").getValue(),
            owner: this.byId("ID_IP_OWNER").getValue(),
            timeline: this.byId("ID_IP_TIMELINE").getValue(),
          },
          sPath = "/Mitigations";

        var mySuccessHandler = function (oData) {
          sap.m.MessageToast.show("Created Successfully.");
          this.onPressClose();
          this.onRefresh();
        }.bind(this);
        this.getModel().createEntry(sPath, {
          properties: oPayload,
        });
        this.getModel().submitChanges({
          success: mySuccessHandler,
        });
      },

      /**
       * Create a new entry.
       */
      onCreate: function () {
        var oList = this.byId("table"),
          oBinding = oList.getBinding("items"),
          // Create a new entry through the table's list binding
          oContext = oBinding.create({
            description: "",
            owner: "",
            timeline: "",
          });

        //this._setUIChanges(true);
        //this.getView().getModel("appView").setProperty("/usernameEmpty", true);

        // Select and focus the table row that contains the newly created entry
        oList.getItems().some(function (oItem) {
          if (oItem.getBindingContext() === oContext) {
            oItem.focus();
            oItem.setSelected(true);
            return true;
          }
        });
      },

      onSave: function () {
        var fnSuccess = function (oData) {
          MessageToast.show(this._getText("createSuccessMessage"));
          // this._setUIChanges(false);
        }.bind(this);

        var fnError = function (oError) {
          // this._setBusy(false);
          // this._setUIChanges(false);
          MessageBox.error(oError.message);
        }.bind(this);

        // this._setBusy(true); // Lock UI until submitBatch is resolved.
        this.getView()
          .getModel()
          .submitBatch("peopleGroup")
          .then(fnSuccess, fnError);
        this._bTechnicalErrors = false; // If there were technical errors, a new save resets them.
      },

      /**
       * Delete an entry.
       */
      onDelete: function () {
        var oSelected = this.byId("table").getSelectedItem();

        if (oSelected) {
          oSelected
            .getBindingContext()
            .delete("$auto")
            .then(
              function () {
                MessageToast.show(this._getText("deletionSuccessMessage"));
              }.bind(this),
              function (oError) {
                MessageBox.error(oError.message);
              }
            );
        }
      },

      /**
       * Convenience method for retrieving a translatable text.
       * @param {string} sTextId - the ID of the text to be retrieved.
       * @param {Array} [aArgs] - optional array of texts for placeholders.
       * @returns {string} the text belonging to the given ID.
       */
      _getText: function (sTextId, aArgs) {
        return this.getOwnerComponent()
          .getModel("i18n")
          .getResourceBundle()
          .getText(sTextId, aArgs);
      },

      /**
       * Refresh the data.
       */
      onRefresh: function () {
        var oBinding = this.byId("table").getBinding("items");

        if (oBinding.hasPendingChanges()) {
          MessageBox.error(this._getText("refreshNotPossibleMessage"));
          return;
        }
        oBinding.refresh();
        MessageToast.show(this._getText("refreshSuccessMessage"));
      },

      /**
       * Sort the table according to the last name.
       * Cycles between the three sorting states "none", "ascending" and "descending"
       */
      onSort: function () {
        var oView = this.getView(),
          aStates = [undefined, "asc", "desc"],
          aStateTextIds = ["sortNone", "sortAscending", "sortDescending"],
          sMessage,
          iOrder = oView.getModel("worklistView").getProperty("/order");

        // Cycle between the states
        iOrder = (iOrder + 1) % aStates.length;
        var sOrder = aStates[iOrder];

        oView.getModel("worklistView").setProperty("/order", iOrder);
        oView
          .byId("table")
          .getBinding("items")
          .sort(sOrder && new Sorter("timeline", sOrder === "desc"));

        sMessage = this._getText("sortMessage", [
          this._getText(aStateTextIds[iOrder]),
        ]);
        MessageToast.show(sMessage);
      },

      onChange: function (oEvent) {
        var bState = oEvent.getSource().getState(),
          sPath =
            oEvent.getSource().getParent().getBindingContextPath() +
            "/RiskService.Mitigations";

        if (bState) {
          this.getView()
            .getModel()
            .requestSideEffects(
              {
                TargetEntities: [
                  {
                    $NavigationPropertyPath: "DraftAdministrativeData",
                  },
                ],
              },
              "peopleGroup"
            );

          // this.getView().getModel().submitBatch("peopleGroup").then(function(odata){

          // });
        }
      },
    });
  }
);
