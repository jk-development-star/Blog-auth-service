const getAuthDetails = async (event) => {
  try {
    if (event.requestContext.authorizer.userId)
      console.log("userId", event.requestContext.authorizer.userId);
    return event.requestContext.authorizer.userId;
  } catch (error) {
    return error.message;
  }
};
module.exports = getAuthDetails;
