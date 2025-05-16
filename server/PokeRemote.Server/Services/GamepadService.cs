using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Grpc.Core;
using Microsoft.Extensions.Logging;
using PokeRemote.Core.Input;
using PokeRemote.Server.Protos;

namespace PokeRemote.Server.Services
{
    public class GamepadService : Protos.GamepadService.GamepadServiceBase
    {
        private readonly ILogger<GamepadService> _logger;
        private readonly KeyboardInjector _keyboardInjector;

        private readonly Dictionary<string, ushort> _keyMapping = new Dictionary<string, ushort>
        {
            ["UP"] = KeyboardInjector.VirtualKeys.VK_UP,
            ["DOWN"] = KeyboardInjector.VirtualKeys.VK_DOWN,
            ["LEFT"] = KeyboardInjector.VirtualKeys.VK_LEFT,
            ["RIGHT"] = KeyboardInjector.VirtualKeys.VK_RIGHT,
            ["A"] = KeyboardInjector.VirtualKeys.VK_Z,
            ["B"] = KeyboardInjector.VirtualKeys.VK_X,
            ["START"] = KeyboardInjector.VirtualKeys.VK_RETURN,
            ["SELECT"] = KeyboardInjector.VirtualKeys.VK_SPACE
        };

        public GamepadService(ILogger<GamepadService> logger)
        {
            _logger = logger;
            _keyboardInjector = new KeyboardInjector();
        }

        public override Task<CommandResponse> SendCommand(GamepadCommand request, ServerCallContext context)
        {
            _logger.LogInformation($"Received command: Button {request.ButtonId}, State {request.State}");
            
            if (!_keyMapping.TryGetValue(request.ButtonId.ToUpper(), out var keyCode))
            {
                return Task.FromResult(new CommandResponse
                {
                    Success = false,
                    Message = $"Unknown button: {request.ButtonId}"
                });
            }

            bool success;
            if (request.State.ToUpper() == "PRESSED")
            {
                success = _keyboardInjector.SendKeyDown(keyCode);
            }
            else if (request.State.ToUpper() == "RELEASED")
            {
                success = _keyboardInjector.SendKeyUp(keyCode);
            }
            else
            {
                return Task.FromResult(new CommandResponse
                {
                    Success = false,
                    Message = $"Unknown state: {request.State}"
                });
            }

            return Task.FromResult(new CommandResponse
            {
                Success = success,
                Message = success ? "Command executed successfully" : "Failed to execute command"
            });
        }

        public override async Task StreamControls(
            IAsyncStreamReader<GamepadCommand> requestStream,
            IServerStreamWriter<CommandResponse> responseStream,
            ServerCallContext context)
        {
            _logger.LogInformation("Started streaming controls session");

            try
            {
                // Process incoming command stream
                await foreach (var command in requestStream.ReadAllAsync())
                {
                    var response = await SendCommand(command, context);
                    await responseStream.WriteAsync(response);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in streaming controls");
            }
            
            _logger.LogInformation("Ended streaming controls session");
        }
    }
}
