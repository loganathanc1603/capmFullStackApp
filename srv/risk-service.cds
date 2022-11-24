using {sap.ui.riskmanagement as my} from '../db/schema';

@path : 'service/risk'
service RiskService {
  entity Risks @(restrict : [
    {
      grant : [
        'READ',
        'WRITE'
      ],
      to    : ['RiskViewer']
    },
    {
      grant : ['*'],
      to    : ['RiskManager']
    }
  ])                      as projection on my.Risks;

  annotate Risks with @odata.draft.enabled;
  entity Mitigations      as projection on my.Mitigations;
  annotate Mitigations with @odata.draft.enabled;

  @readonly
  entity BusinessPartners as projection on my.BusinessPartners;


  entity AffectedUsers    as projection on my.AffectedUsers actions {
    action activateOrDeactivateRisk() returns AffectedUsers;
  };


// entity AffectedUsers as
//   select from my.AffectedUsers {
//     *
//   };

// @(restrict : [
//   {
//     grant : ['READ','WRITE'],
//     to    : ['RiskViewer']
//   },
//   {
//     grant : ['*'],
//     to    : ['RiskManager']
//   }
// ])


}
