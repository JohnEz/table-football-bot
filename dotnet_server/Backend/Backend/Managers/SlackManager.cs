using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;

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
