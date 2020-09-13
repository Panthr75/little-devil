import DiscordCommand from "./DiscordCommand";
import EightBallCommand from "./fun/EightBallCommand";
import FlipCommand from "./fun/FlipCommand";
import HelpCommand from "./util/HelpCommand";
import BalanceCommand from "./economy/BalanceCommand";
import InviteCommand from "./util/InviteCommand";
import HugCommand from "./action-cmds/HugCommand";
import SlapCommand from "./action-cmds/SlapCommand";
import PrefixCommand from "./util/PrefixCommand";
import BanCommand from "./moderation/BanCommand";
import NekoCommand from "./fun/NekoCommand";
import RandomFactCommand from "./fun/RandomFactCommand";
import CatCommand from "./fun/CatCommand";
import DogCommand from "./fun/DogCommand";
import HentaiCommand from "./nsfw/HentaiCommand";
import LewdNekoCommand from "./nsfw/LewdNekoCommand";
import TrapCommand from "./nsfw/TrapCommand";
import KickCommand from "./moderation/KickCommand";
import AccountCommand from "./user/AccountCommand";
import DailyCommand from "./economy/DailyCommand";

let commands: DiscordCommand[] = [];

// action-cmds
commands.push(new HugCommand());
commands.push(new SlapCommand());

// economy
commands.push(new BalanceCommand());
commands.push(new DailyCommand());

// fun commands
commands.push(new EightBallCommand());
commands.push(new FlipCommand());
commands.push(new NekoCommand());
commands.push(new RandomFactCommand());
commands.push(new CatCommand());
commands.push(new DogCommand());

// moderation commands
commands.push(new BanCommand());
commands.push(new KickCommand());

// user commands
commands.push(new AccountCommand());

// util commands
commands.push(new HelpCommand());
commands.push(new InviteCommand());
commands.push(new PrefixCommand());

// nsfw commands
commands.push(new HentaiCommand());
commands.push(new LewdNekoCommand());
commands.push(new TrapCommand());


export default commands;