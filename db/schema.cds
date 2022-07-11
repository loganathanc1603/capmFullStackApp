namespace sap.ui.riskmanagement;

using {managed} from '@sap/cds/common';

entity Risks : managed {
  key ID            : UUID @(Core.Computed : true);
      title         : String(100);
      prio          : String(5);
      descr         : String;
      miti          : Association to Mitigations;
      AffectedUsers : Composition of many AffectedUsers
                        on AffectedUsers.Risks = $self;
      impact        : Integer;
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
  key ID                : UUID    @(Core.Computed : true);
      userName          : String  @readonly;
      firstName         : String  @mandatory;
      lastName          : String;
      gender            : String;
      dateOfBirth       : Date;
      email             : String  @mandatory;
      mobile            : String  @mandatory;
      age               : Integer @mandatory;
      riskActive        : Boolean;
      riskFoundDateTime : DateTime;
      userProfileImage  : LargeBinary;
      Risks             : Association to Risks;
}
