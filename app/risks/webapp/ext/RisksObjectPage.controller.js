sap.ui.define(
    [
        'sap/fe/core/PageController',
        'sap/ui/model/json/JSONModel',
    ],
    function (PageController, JSONModel,) {
        'use strict';

        return PageController.extend('ns.risks.ext.RisksObjectPage', {
            onInit: function () {
                PageController.prototype.onInit.apply(this);
                // let model = {
                //     editable: true
                // };
                // this.getView().setModel(new JSONModel(model), "viewModel");
                const router = this.getAppComponent().getRouter();
                router.getRoute("RisksObjectPage").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function(oSource) {
                var sPath = oSource;
            },

            onChange: function() {
                var oContext = this.getView().getBindingContext();
                this.editFlow.editDocument(oContext).then((oSource) => {
                    console.log(oSource);
                });
            },

            onEdit: function () {
                var sActionName = "RiskService.draftEdit",
                oContext = this.getView().getBindingContext();
                this.editFlow.invokeAction(sActionName,{
                    contexts: oContext,
                    skipParameterDialog: true,
                    requiresNavigation: true
                }).then((oSource) => {
                    // var t = Source;
                    console.log(oSource);
                    this.getView().getModel("ui").setProperty("/isEditable", true);
                });
            },

            onSave: function () {
                var that = this;
                this.editFlow.saveDocument(this.getView().getBindingContext()).then(function (oSource) {
                    // that.getView().getModel("ui").setProperty("/isEditable", false);
                })
            },

            onCancel: function () {
                var that = this;
                this.editFlow.cancelDocument(this.getView().getBindingContext(), {
                    control: this.byId("cancelButton")
                }).then(function (oSource) {
                    // that.getView().getModel("ui").setProperty("/isEditable", false);
                })
            }
        });
    }
);