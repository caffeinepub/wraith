import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";

module {
  type OldActor = {
    missions : Map.Map<Text, Mission>;
    assetProfiles : Map.Map<Text, AssetProfile>;
    threatAssessments : Map.Map<Text, ThreatAssessment>;
    classifiedNotes : Map.Map<Text, ClassifiedNote>;
    missionBriefings : Map.Map<Text, MissionBriefing>;
    userProfiles : Map.Map<Principal, UserProfile>;
    adminPrincipalList : List.List<Principal>;
  };

  type Mission = {
    codename : Text;
    status : { #active; #compromised; #completed; #aborted };
    threatLevel : { #low; #elevated; #critical };
    assignedOperatives : [Text];
    missionType : { #recon; #cyber; #counterTerror; #inPersonOp };
    objectives : [Text];
    fieldReports : [FieldReport];
    createdBy : Principal;
    lastUpdate : Int;
    isTemplate : Bool;
  };

  type FieldReport = {
    timestamp : Int;
    author : Principal;
    content : Text;
  };

  type ThreatAssessment = {
    subjectName : Text;
    threatCategory : {
      #cyber;
      #counterTerror;
      #counterIntelligence;
      #counterEspionage;
      #counterInsurgency;
      #drugSmuggling;
      #humanSmuggling;
      #armsSmuggling;
      #other : Text;
    };
    riskScore : Nat;
    summary : Text;
    linkedMissions : [Text];
    createdBy : Principal;
    lastUpdate : Int;
  };

  type AssetProfile = {
    codename : Text;
    clearanceLevel : {
      #confidential;
      #secret;
      #topSecret;
      #TS_SCI;
    };
    specialization : [{
      #cyber;
      #counterTerror;
      #counterIntelligence;
      #counterEspionage;
      #counterInsurgency;
      #drugIntelligence;
      #militaryIntelligence;
      #humanIntelligence;
      #other : Text;
    }];
    status : { #active; #inactive; #terminated };
    bio : Text;
    createdBy : Principal;
    lastUpdate : Int;
  };

  type ClassifiedNote = {
    title : Text;
    body : Text;
    classification : {
      #confidential;
      #secret;
      #topSecret;
      #TS_SCI;
    };
    timestamp : Int;
    author : Text;
    createdBy : Principal;
  };

  type BriefingObjective = {
    text : Text;
    priority : { #high; #medium; #low };
  };

  type MissionBriefing = {
    operationCodename : Text;
    missionDate : Int;
    leadOfficer : Text;
    objectives : [BriefingObjective];
    hvtProfiles : [{
      name : Text;
      description : Text;
      threatTier : { #low; #elevated; #critical };
    }];
    exfilRoutes : Text;
    rulesOfEngagement : Text;
    classificationLevel : {
      #confidential;
      #secret;
      #topSecret;
      #TS_SCI;
    };
    createdBy : Principal;
    lastUpdate : Int;
  };

  type UserProfile = {
    name : Text;
    callsign : Text;
    department : Text;
  };

  type NewActor = {
    missions : Map.Map<Text, Mission>;
    assetProfiles : Map.Map<Text, AssetProfile>;
    threatAssessments : Map.Map<Text, ThreatAssessment>;
    classifiedNotes : Map.Map<Text, ClassifiedNote>;
    missionBriefings : Map.Map<Text, MissionBriefing>;
    userProfiles : Map.Map<Principal, UserProfile>;
    adminPassword : Text;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      adminPassword = "WRAITH123";
    };
  };
};
