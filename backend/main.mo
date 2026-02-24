import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type MissionStatus = { #active; #compromised; #completed; #aborted };
  type ThreatLevel = { #low; #elevated; #critical };
  type MissionType = { #recon; #cyber; #counterTerror; #inPersonOp };
  type ClearanceLevel = { #confidential; #secret; #topSecret; #TS_SCI };
  type ThreatCategory = {
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
  type SpecializedSkill = {
    #cyber;
    #counterTerror;
    #counterIntelligence;
    #counterEspionage;
    #counterInsurgency;
    #drugIntelligence;
    #militaryIntelligence;
    #humanIntelligence;
    #other : Text;
  };

  public type Mission = {
    codename : Text;
    status : MissionStatus;
    threatLevel : ThreatLevel;
    assignedOperatives : [Text];
    missionType : MissionType;
    objectives : [Text];
    fieldReports : [FieldReport];
    createdBy : Principal;
    lastUpdate : Time.Time;
    isTemplate : Bool;
  };

  public type FieldReport = {
    timestamp : Time.Time;
    author : Principal;
    content : Text;
  };

  public type ThreatAssessment = {
    subjectName : Text;
    threatCategory : ThreatCategory;
    riskScore : Nat;
    summary : Text;
    linkedMissions : [Text];
    createdBy : Principal;
    lastUpdate : Time.Time;
  };

  public type AssetProfile = {
    codename : Text;
    clearanceLevel : ClearanceLevel;
    specialization : [SpecializedSkill];
    status : { #active; #inactive; #terminated };
    bio : Text;
    createdBy : Principal;
    lastUpdate : Time.Time;
  };

  public type ClassifiedNote = {
    title : Text;
    body : Text;
    classification : ClearanceLevel;
    timestamp : Time.Time;
    author : Text;
    createdBy : Principal;
  };

  public type BriefingObjective = {
    text : Text;
    priority : { #high; #medium; #low };
  };

  public type MissionBriefing = {
    operationCodename : Text;
    missionDate : Time.Time;
    leadOfficer : Text;
    objectives : [BriefingObjective];
    hvtProfiles : [HVTProfile];
    exfilRoutes : Text;
    rulesOfEngagement : Text;
    classificationLevel : ClearanceLevel;
    createdBy : Principal;
    lastUpdate : Time.Time;
  };

  public type HVTProfile = {
    name : Text;
    description : Text;
    threatTier : ThreatLevel;
  };

  public type UserProfile = {
    name : Text;
    callsign : Text;
    department : Text;
  };

  module Mission {
    public func compareByLastUpdate(a : Mission, b : Mission) : Order.Order {
      if (a.lastUpdate > b.lastUpdate) { return #less };
      if (a.lastUpdate < b.lastUpdate) { return #greater };
      Text.compare(a.codename, b.codename);
    };

    public func compareByCodename(a : Mission, b : Mission) : Order.Order {
      Text.compare(a.codename, b.codename);
    };
  };

  // State
  let missions = Map.empty<Text, Mission>();
  let assetProfiles = Map.empty<Text, AssetProfile>();
  let threatAssessments = Map.empty<Text, ThreatAssessment>();
  let classifiedNotes = Map.empty<Text, ClassifiedNote>();
  let missionBriefings = Map.empty<Text, MissionBriefing>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Mission CRUD
  public shared ({ caller }) func createMission(
    codename : Text,
    status : MissionStatus,
    threatLevel : ThreatLevel,
    assignedOperatives : [Text],
    missionType : MissionType,
    objectives : [Text]
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create missions");
    };
    if (codename.size() == 0) { Runtime.trap("Mission must have a codename.") };
    let mission : Mission = {
      codename;
      status;
      threatLevel;
      assignedOperatives;
      missionType;
      objectives;
      fieldReports = [];
      createdBy = caller;
      lastUpdate = Time.now();
      isTemplate = false;
    };
    missions.add(codename, mission);
  };

  public query ({ caller }) func getMission(codename : Text) : async Mission {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view missions");
    };
    switch (missions.get(codename)) {
      case (?mission) { mission };
      case (null) { Runtime.trap("Mission " # codename # " not found") };
    };
  };

  public shared ({ caller }) func updateMission(
    codename : Text,
    status : MissionStatus,
    threatLevel : ThreatLevel,
    assignedOperatives : [Text],
    missionType : MissionType,
    objectives : [Text]
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update missions");
    };
    switch (missions.get(codename)) {
      case (?existingMission) {
        if (existingMission.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the mission creator or an admin can update this mission");
        };
        let updatedMission = {
          codename;
          status;
          threatLevel;
          assignedOperatives;
          missionType;
          objectives;
          fieldReports = existingMission.fieldReports;
          createdBy = existingMission.createdBy;
          lastUpdate = Time.now();
          isTemplate = existingMission.isTemplate;
        };
        missions.add(codename, updatedMission);
      };
      case (null) { Runtime.trap("Mission " # codename # " not found") };
    };
  };

  public shared ({ caller }) func addMissionFieldReport(
    codename : Text,
    reportContent : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add field reports");
    };
    switch (missions.get(codename)) {
      case (?existingMission) {
        let newFieldReport : FieldReport = {
          content = reportContent;
          author = caller;
          timestamp = Time.now();
        };
        let updatedFieldReports = existingMission.fieldReports.concat([newFieldReport]);
        let updatedMission = {
          codename;
          status = existingMission.status;
          threatLevel = existingMission.threatLevel;
          assignedOperatives = existingMission.assignedOperatives;
          missionType = existingMission.missionType;
          objectives = existingMission.objectives;
          fieldReports = updatedFieldReports;
          createdBy = existingMission.createdBy;
          lastUpdate = Time.now();
          isTemplate = existingMission.isTemplate;
        };
        missions.add(codename, updatedMission);
      };
      case (null) {
        Runtime.trap("Mission " # codename # " not found");
      };
    };
  };

  public shared ({ caller }) func deleteMission(codename : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete missions");
    };
    switch (missions.get(codename)) {
      case (?_mission) {
        missions.remove(codename);
      };
      case (null) {
        Runtime.trap("Mission " # codename # " not found");
      };
    };
  };

  // Function to get all missions sorted by last update
  public query ({ caller }) func getAllMissions() : async [Mission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view missions");
    };
    missions.values().toArray().sort(Mission.compareByLastUpdate);
  };

  // Function to get filtered missions by status
  public query ({ caller }) func getMissionsByStatus(status : MissionStatus) : async [Mission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view missions");
    };
    let missionValues = missions.values();
    let filteredValues = missionValues.filter(func(m) { m.status == status });
    filteredValues.toArray().sort(Mission.compareByLastUpdate);
  };

  // Intelligence Hub Functions
  public shared ({ caller }) func createAssetProfile(
    codename : Text,
    clearanceLevel : ClearanceLevel,
    specialization : [SpecializedSkill],
    status : { #active; #inactive; #terminated },
    bio : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create asset profiles");
    };
    let asset = {
      codename;
      clearanceLevel;
      specialization;
      status;
      bio;
      createdBy = caller;
      lastUpdate = Time.now();
    };
    assetProfiles.add(codename, asset);
  };

  public shared ({ caller }) func updateAssetProfile(
    codename : Text,
    clearanceLevel : ClearanceLevel,
    specialization : [SpecializedSkill],
    status : { #active; #inactive; #terminated },
    bio : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update asset profiles");
    };
    switch (assetProfiles.get(codename)) {
      case (?existingAsset) {
        if (existingAsset.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or an admin can update this asset profile");
        };
        let updatedAsset = {
          codename;
          clearanceLevel;
          specialization;
          status;
          bio;
          createdBy = existingAsset.createdBy;
          lastUpdate = Time.now();
        };
        assetProfiles.add(codename, updatedAsset);
      };
      case (null) { Runtime.trap("Asset profile " # codename # " not found") };
    };
  };

  public shared ({ caller }) func deleteAssetProfile(codename : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete asset profiles");
    };
    switch (assetProfiles.get(codename)) {
      case (?_asset) { assetProfiles.remove(codename) };
      case (null) { Runtime.trap("Asset profile " # codename # " not found") };
    };
  };

  public query ({ caller }) func getAssetProfile(codename : Text) : async AssetProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view asset profiles");
    };
    switch (assetProfiles.get(codename)) {
      case (?asset) { asset };
      case (null) { Runtime.trap("Not found: " # codename) };
    };
  };

  public query ({ caller }) func getAllAssetProfiles() : async [AssetProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view asset profiles");
    };
    assetProfiles.values().toArray();
  };

  public shared ({ caller }) func createThreatAssessment(
    subjectName : Text,
    threatCategory : ThreatCategory,
    riskScore : Nat,
    summary : Text,
    linkedMissions : [Text]
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create threat assessments");
    };
    let assessment = {
      subjectName;
      threatCategory;
      riskScore;
      summary;
      linkedMissions;
      createdBy = caller;
      lastUpdate = Time.now();
    };
    threatAssessments.add(subjectName, assessment);
  };

  public shared ({ caller }) func updateThreatAssessment(
    subjectName : Text,
    threatCategory : ThreatCategory,
    riskScore : Nat,
    summary : Text,
    linkedMissions : [Text]
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update threat assessments");
    };
    switch (threatAssessments.get(subjectName)) {
      case (?existingAssessment) {
        if (existingAssessment.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or an admin can update this threat assessment");
        };
        let updatedAssessment = {
          subjectName;
          threatCategory;
          riskScore;
          summary;
          linkedMissions;
          createdBy = existingAssessment.createdBy;
          lastUpdate = Time.now();
        };
        threatAssessments.add(subjectName, updatedAssessment);
      };
      case (null) { Runtime.trap("Threat assessment " # subjectName # " not found") };
    };
  };

  public shared ({ caller }) func deleteThreatAssessment(subjectName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete threat assessments");
    };
    switch (threatAssessments.get(subjectName)) {
      case (?_assessment) { threatAssessments.remove(subjectName) };
      case (null) { Runtime.trap("Threat assessment " # subjectName # " not found") };
    };
  };

  public query ({ caller }) func getThreatAssessment(subjectName : Text) : async ThreatAssessment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view threat assessments");
    };
    switch (threatAssessments.get(subjectName)) {
      case (?assessment) { assessment };
      case (null) { Runtime.trap("Not found: " # subjectName) };
    };
  };

  public query ({ caller }) func getAllThreatAssessments() : async [ThreatAssessment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view threat assessments");
    };
    threatAssessments.values().toArray();
  };

  public shared ({ caller }) func createClassifiedNote(
    title : Text,
    body : Text,
    classification : ClearanceLevel,
    author : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create classified notes");
    };
    let note = {
      title;
      body;
      classification;
      author;
      createdBy = caller;
      timestamp = Time.now();
    };
    classifiedNotes.add(title, note);
  };

  public shared ({ caller }) func updateClassifiedNote(
    title : Text,
    body : Text,
    classification : ClearanceLevel,
    author : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update classified notes");
    };
    switch (classifiedNotes.get(title)) {
      case (?existingNote) {
        if (existingNote.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or an admin can update this note");
        };
        let updatedNote = {
          title;
          body;
          classification;
          author;
          createdBy = existingNote.createdBy;
          timestamp = existingNote.timestamp;
        };
        classifiedNotes.add(title, updatedNote);
      };
      case (null) { Runtime.trap("Classified note " # title # " not found") };
    };
  };

  public shared ({ caller }) func deleteClassifiedNote(title : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete classified notes");
    };
    switch (classifiedNotes.get(title)) {
      case (?_note) { classifiedNotes.remove(title) };
      case (null) { Runtime.trap("Classified note " # title # " not found") };
    };
  };

  public query ({ caller }) func getClassifiedNote(title : Text) : async ClassifiedNote {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view classified notes");
    };
    switch (classifiedNotes.get(title)) {
      case (?note) { note };
      case (null) { Runtime.trap("Not found: " # title) };
    };
  };

  public query ({ caller }) func getAllClassifiedNotes() : async [ClassifiedNote] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view classified notes");
    };
    classifiedNotes.values().toArray();
  };

  // Briefing Tool Functions
  public shared ({ caller }) func createMissionBriefing(
    operationCodename : Text,
    missionDate : Time.Time,
    leadOfficer : Text,
    objectives : [BriefingObjective],
    hvtProfiles : [HVTProfile],
    exfilRoutes : Text,
    rulesOfEngagement : Text,
    classificationLevel : ClearanceLevel
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create mission briefings");
    };
    let briefing = {
      operationCodename;
      missionDate;
      leadOfficer;
      objectives;
      hvtProfiles;
      exfilRoutes;
      rulesOfEngagement;
      classificationLevel;
      createdBy = caller;
      lastUpdate = Time.now();
    };
    missionBriefings.add(operationCodename, briefing);
  };

  public shared ({ caller }) func updateMissionBriefing(
    operationCodename : Text,
    missionDate : Time.Time,
    leadOfficer : Text,
    objectives : [BriefingObjective],
    hvtProfiles : [HVTProfile],
    exfilRoutes : Text,
    rulesOfEngagement : Text,
    classificationLevel : ClearanceLevel
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update mission briefings");
    };
    switch (missionBriefings.get(operationCodename)) {
      case (?existingBriefing) {
        if (existingBriefing.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or an admin can update this briefing");
        };
        let updatedBriefing = {
          operationCodename;
          missionDate;
          leadOfficer;
          objectives;
          hvtProfiles;
          exfilRoutes;
          rulesOfEngagement;
          classificationLevel;
          createdBy = existingBriefing.createdBy;
          lastUpdate = Time.now();
        };
        missionBriefings.add(operationCodename, updatedBriefing);
      };
      case (null) { Runtime.trap("Mission briefing " # operationCodename # " not found") };
    };
  };

  public shared ({ caller }) func deleteMissionBriefing(operationCodename : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete mission briefings");
    };
    switch (missionBriefings.get(operationCodename)) {
      case (?_briefing) { missionBriefings.remove(operationCodename) };
      case (null) { Runtime.trap("Mission briefing " # operationCodename # " not found") };
    };
  };

  public query ({ caller }) func getMissionBriefing(operationCodename : Text) : async MissionBriefing {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view mission briefings");
    };
    switch (missionBriefings.get(operationCodename)) {
      case (?briefing) { briefing };
      case (null) { Runtime.trap("Mission briefing not found!") };
    };
  };

  public query ({ caller }) func getAllMissionBriefings() : async [MissionBriefing] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view mission briefings");
    };
    missionBriefings.values().toArray();
  };

  // Utility Function to get Current Timestamp
  public query func getCurrentTimestamp() : async Time.Time {
    Time.now();
  };

  // Document Template Functions
  public shared ({ caller }) func saveMissionTemplate(
    codename : Text,
    status : MissionStatus,
    threatLevel : ThreatLevel,
    assignedOperatives : [Text],
    missionType : MissionType,
    objectives : [Text]
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can save mission templates");
    };
    switch (missions.get(codename)) {
      case (?_existingTemplate) {
        Runtime.trap("Template " # codename # " already exists");
      };
      case (null) {
        let template : Mission = {
          codename;
          status;
          threatLevel;
          assignedOperatives;
          missionType;
          objectives;
          fieldReports = [];
          createdBy = caller;
          lastUpdate = Time.now();
          isTemplate = true;
        };
        missions.add(codename, template);
      };
    };
  };

  public query ({ caller }) func getMissionTemplates() : async [Mission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view mission templates");
    };
    missions.values().filter(func(m) { m.isTemplate }).toArray().sort(Mission.compareByCodename);
  };

  // Custom sorting functions for missions
  func getFilteredAndSortedMissions(filterFunc : Mission -> Bool, sortFunc : ([Mission]) -> [Mission]) : [Mission] {
    let resultList = List.empty<Mission>();
    for (mission in missions.values()) {
      if (filterFunc(mission)) {
        resultList.add(mission);
      };
    };
    sortFunc(resultList.toArray());
  };

  func sortByCodename(array : [Mission]) : [Mission] {
    array.sort(Mission.compareByCodename);
  };
};
