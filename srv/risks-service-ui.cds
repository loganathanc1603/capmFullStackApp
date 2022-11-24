using RiskService from './risk-service';

annotate RiskService.Mitigations with {
    ID          @(
        UI.Hidden,
        Common : {Text : description}
    );
    description @title : '{i18n>RISK_DESC}';
    owner       @title : '{i18n>OWNER}';
    timeline    @title : '{i18n>TIMELINE}';
    risks       @title : '{i18n>RISKS}';
};


annotate RiskService.Risks with @(
    title : 'Risk Entity',
    UI    : {
        HeaderInfo       : {
            TypeName       : 'Risk',
            TypeNamePlural : 'Risks',
            Title          : {
                $Type : 'UI.DataField',
                Value : title
            },
            Description    : {
                $Type : 'UI.DataField',
                Value : descr
            }
        },
        SelectionFields  : [
            title,
            prio,
            miti_ID,
            impact
        ],
        LineItem         : [
            {Value : title},
            {Value : miti_ID},
            {Value : descr},
            {Value : bp_BusinessPartner},
            {
                Value       : prio,
                Criticality : criticality
            },
            {
                Value       : impact,
                Criticality : criticality
            },
            {Value : createdBy},
            {Value : createdAt}
        ],
        Facets           : [
            {
                $Type  : 'UI.ReferenceFacet',
                Label  : '{i18n>RISK_OVERVIEW}',
                Target : '@UI.FieldGroup#Main'
            },
            {
                $Type  : 'UI.ReferenceFacet',
                Label  : '{i18n>AFFECTED_USER_TITLE}',
                Target : 'AffectedUsers/@UI.LineItem'
            }
        ],
        FieldGroup #Main : {Data : [
            {Value : title},
            {Value : descr},
            {
                Value       : prio,
                Criticality : criticality
            },
            {
                Value       : impact,
                Criticality : criticality
            },
            {Value : miti_ID},
            {Value : bp_BusinessPartner},
            {Value : createdBy},
            {Value : createdAt}
        ]}
    }
) {
    title  @title : '{i18n>RISK_TITLE}';
    prio   @title : '{i18n>PRIORITY}';
    descr  @title : '{i18n>RISK_DESC}';
    impact @title : '{i18n>IMPACT}';
    bp     @title : '{i18n>BP}';
    miti   @(
        title  : '{i18n>MITIGATION_ID}',
        Common : {
            //show text, not id for mitigation in the context of risks
            Text            : miti.description,
            TextArrangement : #TextSeparate,
            ValueList       : {
                Label          : 'Mitigations',
                CollectionPath : 'Mitigations',
                Parameters     : [
                    {
                        $Type             : 'Common.ValueListParameterInOut',
                        LocalDataProperty : miti_ID,
                        ValueListProperty : 'ID'
                    },
                    {
                        $Type             : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty : 'description'
                    }
                ]
            }
        }
    );
    bp     @(Common : {
        Text            : bp.LastName,
        TextArrangement : #TextOnly,
        ValueList       : {
            Label          : 'Business Partners',
            CollectionPath : 'BusinessPartners',
            Parameters     : [
                {
                    $Type             : 'Common.ValueListParameterInOut',
                    LocalDataProperty : bp_BusinessPartner,
                    ValueListProperty : 'BusinessPartner'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'LastName'
                },
                {
                    $Type             : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty : 'FirstName'
                }
            ]
        }
    })
};

annotate RiskService.AffectedUsers with @Common.SemanticKey : [ID];

annotate RiskService.AffectedUsers with @(UI : {
    Identification          : [{
        $Type  : 'UI.DataFieldForAction',
        Action : 'RiskService.activateOrDeactivateRisk',
        Label  : 'Activate or Deactivate Risk'
    }],
    LineItem                : [
        {
            $Type  : 'UI.DataFieldForAction',
            Action : 'RiskService.activateOrDeactivateRisk',
            Label  : 'Activate or Deactivate Risk'
        },
        {Value : userName},
        {Value : firstName},
        {Value : lastName},
        {Value : mobile},
        {Value : email},
        {Value : dateOfBirth},
        {Value : riskActive},
        {Value : riskFoundDateTime},
    ],
    HeaderInfo              : {
        $Type          : 'UI.HeaderInfoType',
        TypeName       : '{i18n>AFFECTED_USER_TITLE}',
        TypeNamePlural : '{i18n>AFFECTED_USER_TITLE}',
        Title          : {
            $Type : 'UI.DataField',
            Value : firstName
        },
        Description    : {
            $Type : 'UI.DataField',
            Value : userName
        }
    },
    HeaderFacets            : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>DATE_OF_BIRTH}',
        ID     : 'DOB',
        Target : '@UI.DataPoint#DateOfBirth'
    }],
    DataPoint #DateOfBirth  : {
        $Type : 'UI.DataPointType',
        Value : dateOfBirth,
        Title : '{i18n>DATE_OF_BIRTH}'
    },

    Facets                  : [{
        $Type  : 'UI.CollectionFacet',
        Label  : '{i18n>BASIC_INFORMATION_TITLE}',
        ID     : 'BASICDATA',
        Facets : [
            {
                $Type  : 'UI.ReferenceFacet',
                Target : '@UI.FieldGroup#GeneralData',
                Label  : '{i18n>GENERAL_DATA}',
                ID     : 'GENERAL_DATA',
            },
            {
                $Type  : 'UI.ReferenceFacet',
                Target : '@UI.FieldGroup#AdminData',
                Label  : '{i18n>ADMIN_DATA}',
                ID     : 'ADMIN_DATA',
            }
        ],
    }],
    FieldGroup #GeneralData : {
        $Type : 'UI.FieldGroupType',
        Data  : [
            {
                $Type : 'UI.DataField',
                Value : userName
            },
            {
                $Type : 'UI.DataField',
                Value : firstName
            },
            {
                $Type : 'UI.DataField',
                Value : lastName
            },
            {
                $Type : 'UI.DataField',
                Value : age
            },
            {
                $Type : 'UI.DataField',
                Value : gender
            },
            {
                $Type : 'UI.DataField',
                Value : mobile
            },
            {
                $Type : 'UI.DataField',
                Value : email
            },
            {
                $Type : 'UI.DataField',
                Value : riskActive
            },
            {
                $Type : 'UI.DataField',
                Value : riskFoundDateTime
            },
            {
                $Type : 'UI.DataField',
                Value : userProfileImage
            }
        ]
    },
    FieldGroup #AdminData   : {
        $Type : 'UI.FieldGroupType',
        Data  : [
            {
                $Type : 'UI.DataField',
                Value : createdAt
            },
            {
                $Type : 'UI.DataField',
                Value : createdBy
            },
            {
                $Type : 'UI.DataField',
                Value : modifiedAt
            },
            {
                $Type : 'UI.DataField',
                Value : modifiedBy
            }
        ]
    }
}) {
    userName          @(title : '{i18n>USER_ID}');
    firstName         @(title : '{i18n>FIRST_NAME}');
    lastName          @(title : '{i18n>LAST_NAME}');
    mobile            @(title : '{i18n>MOBILE_NO}');
    email             @(title : '{i18n>EMAIL}');
    dateOfBirth       @(title : '{i18n>DATE_OF_BIRTH}');
    age               @(title : '{i18n>AGE}');
    gender            @(title : '{i18n>GENDER}');
    riskActive        @(title : '{i18n>RISK_ACTIVE}');
    riskFoundDateTime @(title : '{i18n>RISK_FOUND_DATETIME}');
    userProfileImage  @(title : '{i18n>PROFILE_IMAGE}')
};

annotate RiskService.BusinessPartners with {
    BusinessPartner @(
        UI.Hidden,
        Common : {Text : LastName}
    );
    LastName        @title : 'Last Name';
    FirstName       @title : 'First Name';
}
