namespace sap.ui.riskmanagement;

using {managed} from '@sap/cds/common';

entity Risks : managed {
  key ID            : UUID @(Core.Computed : true);
      title         : String(110);
      owner         : String;
      prio          : String(5);
      descr         : String;
      miti          : Association to Mitigations;
      AffectedUsers : Composition of many AffectedUsers
                        on AffectedUsers.Risks = $self;
      impact        : Integer;
      bp            : Association to BusinessPartners;
      criticality   : Integer;
}

entity Mitigations : managed {
  key ID          : UUID @(Core.Computed : true);
      description : String;
      owner       : String;
      timeline    : String;
      risks       : Association to many Risks
                      on risks.miti = $self;
}

entity AffectedUsers : managed {
  key ID                : UUID   @(Core.Computed : true);
      userName          : String @readonly;
      firstName         : String;
      lastName          : String;
      gender            : String;
      dateOfBirth       : Date;
      email             : String;
      mobile            : String;
      age               : Integer;
      riskActive        : Boolean;
      riskFoundDateTime : DateTime;
      userProfileImage  : LargeBinary;
      Risks             : Association to Risks;
}


// using an external service from S/4
using {API_BUSINESS_PARTNER as external} from '../srv/external/API_BUSINESS_PARTNER.csn';

entity BusinessPartners as projection on external.A_BusinessPartner {
  key BusinessPartner,
      LastName,
      FirstName
}
