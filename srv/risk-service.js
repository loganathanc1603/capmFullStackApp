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

  srv.before("CREATE", "Risks", (aData) =>{
    const affctedUser = Array.isArray(aData.data.AffectedUsers) ? aData.data.AffectedUsers : [aData.data.AffectedUsers];

    affctedUser.forEach((oValue) => {
        let sUserName = new Date().getMilliseconds();
        oValue.userName = "USER-" + sUserName;
        });
  });
};
