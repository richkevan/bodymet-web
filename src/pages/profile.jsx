const Profile = () => {
  const clientId = process.env.REACT_APP_WITHINGS_clientID
  const clientSecret = process.env.REACT_APP_WITHINGS_clientSecret
  const callBack = process.env.REACT_APP_WITHINGS_callback
  const state = "t3stW1th1ng"
  const mode = "demo"

  const handleWithings = async () => {
    window.location.replace(`https://account.withings.com/oauth2_user/authorize2?response_type=code&client_id=${clientId}&state=${state}&scope=user.info,user.metrics,user.activity&redirect_uri=${callBack}&mode=${mode}`)
  }

  return (
    <>
      <div>Profile</div>
      <button onClick={handleWithings}>Connect Withings</button>
    </>
  )
}

export default Profile