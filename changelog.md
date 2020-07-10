# Changelog
The changelog of features for Little Devil

___
### 0.23.0 Alpha
- Added transfer command:
  - **Aliases**: `pay`
  - **Description**: Transfers the given money amount to the given user
  - **Usage**: `transfer <user> <amount>`
    - Transfers the `amount` to the given `user`
    - `user` - The username, mention, or id of the user to transfer the money to
    - `amount` - The amount of money to transfer
  - **Example**: `?transfer Bob 500`
    - (Transfers 500 moneys to Bob. That is, of course, if you have enough money)
  - **Note**: You may not use this command if economy is disabled, or it won't work if the person you are requesting to give money to could not be found, you are transfering money to the bots, or yourself, or you didn't enter a positive non-zero integer of money.
- Added one extra gif for Slap Command
___
### 0.22.1 Alpha
- Fixed Daily Command Streaks (Hopefully)
- Fixed [Logs for "resume" and "reconnecting" events spam console](https://github.com/Panthr75/little-devil/issues/9) (Issue #9)
___
### 0.22.0 Alpha
- Fixed [Cache ActionCommand Gifs](https://github.com/Panthr75/little-devil/issues/6) (Issue #6)
- Fixed [Little Devil has no Permission Level](https://github.com/Panthr75/little-devil/issues/7) (Issue #7)
- Fixed [WhoIs Permissions shows "View Channel"](https://github.com/Panthr75/little-devil/issues/8) (Issue #8)
