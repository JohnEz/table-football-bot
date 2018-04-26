using System.Net.Http;

namespace Backend.Managers
{
    public class SlackManager
    {
        public async void SendMessageToMe(string message)
        {
            HttpClient httpClient = new HttpClient();
            string url = "https://slack.com/api/chat.postMessage?token=" + Constants.SlackDetails.token
                + "&channel=" + Constants.SlackDetails.channel
                + "&text=" + message
                + "&as_user=" + Constants.SlackDetails.user
                + "&pretty=1";
            await httpClient.GetStringAsync(url);
        }
    }
}
