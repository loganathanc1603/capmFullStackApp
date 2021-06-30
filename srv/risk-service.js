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
};
