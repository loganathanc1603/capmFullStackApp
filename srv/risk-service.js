/**
 * Implementation for Risk Management service defined in ./risk-service.cds
 */
module.exports = async (srv) => {
  srv.after("READ", "Risks", (risksData) => {
    const risks = Array.isArray(risksData) ? risksData : [risksData];
    risks.forEach((risk) => {
      if (risk.impact <= 1000) {
        risk.criticality = 3;
      } else if (risk.impact <= 10000) {
        risk.criticality = 2;
      } else if (risk.impact >= 90000) {
        risk.criticality = 1;
      } else {
        risk.criticality = 0;
      }
    });
  });

  srv.before("CREATE", "Risks", (aData) => {
    const affectedUser = Array.isArray(aData.data.AffectedUsers)
      ? aData.data.AffectedUsers
      : [aData.data.AffectedUsers];

    affectedUser.forEach((oValue) => {
      let sUserName = new Date().getMilliseconds();
      oValue.userName = "USER-" + sUserName;
    });
  });

  // srv.on ('activateOrDeactivateRisk', req => UPDATE (req._target) .with (
  //   {riskActive:true})
  // );

  srv.on("activateOrDeactivateRisk", async (req) => {
    if (req) {
      console.log(req);
    }
  });

  // connect to remote service
  const BPsrv = await cds.connect.to("API_BUSINESS_PARTNER");

  /**
   * Event-handler for read-events on the BusinessPartners entity.
   * Each request to the API Business Hub requires the apikey in the header.
   */
  srv.on("READ", "BusinessPartners", async (req) => {
    // The API Sandbox returns alot of business partners with empty names.
    // We don't want them in our application
    req.query.where("LastName <> '' and FirstName <> '' ");

    return await BPsrv.transaction(req).send({
      query: req.query,
      headers: {
        apikey: process.env.apikey,
      },
    });
  });

  /**
* Event-handler on risks.
* Retrieve BusinessPartner data from the external API
*/
  srv.on("READ", "Risks", async (req, next) => {
    /*
        Check whether the request wants an "expand" of the business partner
        As this is not possible, the risk entity and the business partner entity are in different systems (SAP BTP and S/4 HANA Cloud),
        if there is such an expand, remove it
        */

    if (!req.query.SELECT.columns) return next();

    const expandIndex = req.query.SELECT.columns.findIndex(
      ({ expand, ref }) => expand && ref[0] === "bp"
    );
    console.log(req.query.SELECT.columns);
    if (expandIndex < 0) return next();

    req.query.SELECT.columns.splice(expandIndex, 1);
    if (
      !req.query.SELECT.columns.find((column) =>
        column.ref.find((ref) => ref == "bp_BusinessPartner")
      )
    ) {
      req.query.SELECT.columns.push({ ref: ["bp_BusinessPartner"] });
    }

    /*
        Instead of carrying out the expand, issue a separate request for each business partner
        This code could be optimized, instead of having n requests for n business partners, just one bulk request could be created
        */
    try {
      var res = await next();
      res = Array.isArray(res) ? res : [res];

      await Promise.all(
        res.map(async (risk) => {
          const bp = await BPsrv.transaction(req).send({
            query: SELECT.one(this.entities.BusinessPartners)
              .where({ BusinessPartner: risk.bp_BusinessPartner })
              .columns(["BusinessPartner", "LastName", "FirstName"]),
            headers: {
              apikey: process.env.apikey,
            },
          });
          risk.bp = bp;
        })
      );
    } catch (error) { }
  });



};
