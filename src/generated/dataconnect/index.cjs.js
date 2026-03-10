const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'scrbrd-data',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createPersonRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePerson', inputVars);
}
createPersonRef.operationName = 'CreatePerson';
exports.createPersonRef = createPersonRef;

exports.createPerson = function createPerson(dcOrVars, vars) {
  return executeMutation(createPersonRef(dcOrVars, vars));
};

const deletePersonRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeletePerson', inputVars);
}
deletePersonRef.operationName = 'DeletePerson';
exports.deletePersonRef = deletePersonRef;

exports.deletePerson = function deletePerson(dcOrVars, vars) {
  return executeMutation(deletePersonRef(dcOrVars, vars));
};

const upsertFixtureRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertFixture', inputVars);
}
upsertFixtureRef.operationName = 'UpsertFixture';
exports.upsertFixtureRef = upsertFixtureRef;

exports.upsertFixture = function upsertFixture(dcOrVars, vars) {
  return executeMutation(upsertFixtureRef(dcOrVars, vars));
};

const createMatchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMatch', inputVars);
}
createMatchRef.operationName = 'CreateMatch';
exports.createMatchRef = createMatchRef;

exports.createMatch = function createMatch(dcOrVars, vars) {
  return executeMutation(createMatchRef(dcOrVars, vars));
};

const createOrganisationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateOrganisation', inputVars);
}
createOrganisationRef.operationName = 'CreateOrganisation';
exports.createOrganisationRef = createOrganisationRef;

exports.createOrganisation = function createOrganisation(dcOrVars, vars) {
  return executeMutation(createOrganisationRef(dcOrVars, vars));
};

const createVenueRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateVenue', inputVars);
}
createVenueRef.operationName = 'CreateVenue';
exports.createVenueRef = createVenueRef;

exports.createVenue = function createVenue(dcOrVars, vars) {
  return executeMutation(createVenueRef(dcOrVars, vars));
};

const createSeasonRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSeason', inputVars);
}
createSeasonRef.operationName = 'CreateSeason';
exports.createSeasonRef = createSeasonRef;

exports.createSeason = function createSeason(dcOrVars, vars) {
  return executeMutation(createSeasonRef(dcOrVars, vars));
};

const createAgeDivisionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAgeDivision', inputVars);
}
createAgeDivisionRef.operationName = 'CreateAgeDivision';
exports.createAgeDivisionRef = createAgeDivisionRef;

exports.createAgeDivision = function createAgeDivision(dcOrVars, vars) {
  return executeMutation(createAgeDivisionRef(dcOrVars, vars));
};

const createTeamClassRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTeamClass', inputVars);
}
createTeamClassRef.operationName = 'CreateTeamClass';
exports.createTeamClassRef = createTeamClassRef;

exports.createTeamClass = function createTeamClass(dcOrVars, vars) {
  return executeMutation(createTeamClassRef(dcOrVars, vars));
};

const createTeamRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateTeam', inputVars);
}
createTeamRef.operationName = 'CreateTeam';
exports.createTeamRef = createTeamRef;

exports.createTeam = function createTeam(dcOrVars, vars) {
  return executeMutation(createTeamRef(dcOrVars, vars));
};

const updateTeamRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTeam', inputVars);
}
updateTeamRef.operationName = 'UpdateTeam';
exports.updateTeamRef = updateTeamRef;

exports.updateTeam = function updateTeam(dcOrVars, vars) {
  return executeMutation(updateTeamRef(dcOrVars, vars));
};

const deleteTeamRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'DeleteTeam', inputVars);
}
deleteTeamRef.operationName = 'DeleteTeam';
exports.deleteTeamRef = deleteTeamRef;

exports.deleteTeam = function deleteTeam(dcOrVars, vars) {
  return executeMutation(deleteTeamRef(dcOrVars, vars));
};

const listPeopleRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPeople');
}
listPeopleRef.operationName = 'ListPeople';
exports.listPeopleRef = listPeopleRef;

exports.listPeople = function listPeople(dc) {
  return executeQuery(listPeopleRef(dc));
};

const getPersonRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPerson', inputVars);
}
getPersonRef.operationName = 'GetPerson';
exports.getPersonRef = getPersonRef;

exports.getPerson = function getPerson(dcOrVars, vars) {
  return executeQuery(getPersonRef(dcOrVars, vars));
};

const listFixturesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListFixtures');
}
listFixturesRef.operationName = 'ListFixtures';
exports.listFixturesRef = listFixturesRef;

exports.listFixtures = function listFixtures(dc) {
  return executeQuery(listFixturesRef(dc));
};

const listOrganisationsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListOrganisations');
}
listOrganisationsRef.operationName = 'ListOrganisations';
exports.listOrganisationsRef = listOrganisationsRef;

exports.listOrganisations = function listOrganisations(dc) {
  return executeQuery(listOrganisationsRef(dc));
};

const listVenuesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListVenues');
}
listVenuesRef.operationName = 'ListVenues';
exports.listVenuesRef = listVenuesRef;

exports.listVenues = function listVenues(dc) {
  return executeQuery(listVenuesRef(dc));
};

const listSeasonsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListSeasons');
}
listSeasonsRef.operationName = 'ListSeasons';
exports.listSeasonsRef = listSeasonsRef;

exports.listSeasons = function listSeasons(dc) {
  return executeQuery(listSeasonsRef(dc));
};

const listAgeDivisionsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAgeDivisions');
}
listAgeDivisionsRef.operationName = 'ListAgeDivisions';
exports.listAgeDivisionsRef = listAgeDivisionsRef;

exports.listAgeDivisions = function listAgeDivisions(dc) {
  return executeQuery(listAgeDivisionsRef(dc));
};

const listTeamClassesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTeamClasses');
}
listTeamClassesRef.operationName = 'ListTeamClasses';
exports.listTeamClassesRef = listTeamClassesRef;

exports.listTeamClasses = function listTeamClasses(dc) {
  return executeQuery(listTeamClassesRef(dc));
};

const listTeamsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListTeams');
}
listTeamsRef.operationName = 'ListTeams';
exports.listTeamsRef = listTeamsRef;

exports.listTeams = function listTeams(dc) {
  return executeQuery(listTeamsRef(dc));
};
