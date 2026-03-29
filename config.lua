Config = {}

-- =============================================
-- GENERAL
-- =============================================
Config.Locale    = 'en'
Config.Framework = 'esx'

-- =============================================
-- HUD SETTINGS
-- =============================================
Config.HUD = {
    ShowForPassengers   = true,
    PassengerMinimalHUD = true,      -- Passengers only see speed/fuel, hide controls
    HideWhenOnFoot      = true,
    FadeDuration        = 300,
    UpdateInterval      = 100,       -- ms between HUD refreshes
    ShowFuel            = true,
    ShowSpeed           = true,
    ShowRPM             = true,
    ShowSeatbelt        = true,
    ShowDamage          = true,
    ShowGear            = true,
    ShowEngineStatus    = true,
    SpeedUnit           = 'mph',     -- 'mph' or 'kmh'
    MaxSpeed            = 200,
    -- HUD colour theme:
    --   'neutral'  — original fully-transparent glass, sky-blue accent (default)
    --   'dark'     — near-black frosted panel, vivid cyan neon, high contrast
    --   'light'    — white frosted glass, dark readable text, steel-blue accent
    Theme = 'light',
}

-- =============================================
-- FUEL SYSTEM
-- =============================================
Config.Fuel = {
    -- If ox_fuel is running, this script will defer ALL fuel logic to it
    -- and only read its state bag. Set to false to always use built-in system.
    UseOxFuelIfAvailable = false,

    -- ---- Built-in fuel system (used when ox_fuel is NOT present) ----

    Enabled = true,

    -- Fuel always loads from the database (owned_vehicles.fuel_level).
    -- Unowned/NPC vehicles fall back to GTA's native fuel level.
    -- There is no random or "start full" option — DB is the only source of truth.

    -- Consumption: fuel % lost per second while engine is running.
    -- Scales with RPM. Idle = BaseConsumption, full throttle = Base * MaxMultiplier.
    BaseConsumption  = 0.015,
    MaxMultiplier    = 3.5,
    -- Extra drain when petrol tank is damaged (tank health < 700)
    DamagedTankExtra = 0.04,

    -- Kill engine when fuel hits 0
    StopOnEmpty = true,

    -- Warning / critical display thresholds (%)
    WarningThreshold  = 20,
    CriticalThreshold = 10,

    -- How often (seconds) to sync fuel level to server so it persists
    SaveInterval = 30,

    -- ---- Gas stations ----
    Stations = {
        PricePerUnit  = 3,       -- $ per 1% of fuel ($3 x 100 = $300 full tank)
        RefillValue   = 0.4,     -- % added per tick
        RefillTick    = 300,     -- ms per tick
        PumpDistance  = 3.0,     -- metres to trigger pump zone
        ShowBlips     = 1,       -- 0=none  1=nearest  2=all
        PaymentMethod = 'cash',  -- 'cash' or 'bank'

        -- Key to start refueling (no ox_target needed)
        RefuelKey      = 'e',
        RefuelKeyLabel = 'Refuel Vehicle',

        -- Pump prop models that create interaction zones
        PumpModels = {
            `prop_gas_pump_old2`,
            `prop_gas_pump_1a`,
            `prop_vintage_pump`,
            `prop_gas_pump_old3`,
            `prop_gas_pump_1c`,
            `prop_gas_pump_1b`,
            `prop_gas_pump_1d`,
        },
    },

    -- ---- Petrol can (fills vehicle from inventory) ----
    PetrolCan = {
        Enabled        = true,
        ItemName       = 'WEAPON_PETROLCAN',
        FuelAmount     = 30,     -- % provided by a full can
        DurabilityTick = 1.3,
        Duration       = 5000,
    },
}

-- =============================================
-- SEATBELT
-- =============================================
Config.Seatbelt = {
    Enabled          = true,
    Key              = 'b',
    KeyLabel         = 'Toggle Seatbelt',
    ShowNotification = true,
}

-- =============================================
-- ENGINE
-- =============================================
Config.Engine = {
    Key           = 'g',
    KeyLabel      = 'Toggle Engine',
    RequireKey    = true,
    PlayAnimation = true,
}

-- =============================================
-- VEHICLE KEY ITEM
-- =============================================
Config.VehicleKey = {
    ItemName      = 'vehicle_key',
    LockKey       = 'u',
    KeyLabel      = 'Lock / Unlock Vehicle',
    LockDistance  = 5.0,
    PlayAnimation = true,
    LockAnim      = { dict = 'anim@mp_player_intmenu@key_fob@', clip = 'fob_click' },
    Show3DLabel   = true,
    PlayLockSound = true,
}

-- =============================================
-- KEY REPLACEMENT PED
-- =============================================
Config.KeyReplacement = {
    Enabled          = true,
    Cost             = 500,
    PedCoords        = vec4(-39.876923, -1094.373657, 26.415405, 0.0),
    PedModel         = 'ig_floyd',
    InteractDistance = 2.5,
    TargetRadius     = 1.5,
    MenuTitle        = 'Key Replacement',
    MenuIcon         = 'fa-solid fa-key',
}

-- =============================================
-- HOTWIRE
-- =============================================
Config.Hotwire = {
    Key                  = 'h',
    KeyLabel             = 'Hotwire / Lockpick',
    WireHangerItem       = 'wire_hanger',
    SkillCheckDifficulty = { 'easy', 'easy', 'medium' },
    AnimDuration         = 3000,
    Cooldown             = 10000,
    LockpickBreakChance  = 20,
    AlertPolice          = false,
    AlertDistance        = 50.0,
    -- How long (seconds) a hotwired vehicle can sit UNOCCUPIED before
    -- the hotwire expires and the engine cuts. Player must hotwire again.
    UnoccupiedTimeout    = 120,
}

-- =============================================
-- DAMAGE
-- =============================================
Config.Damage = {
    Enabled = true,

    -- Engine health below this value = engine dies and won't restart
    EngineFailThreshold  = 150,

    -- HUD warning arc turns orange at this body health value (0–1000)
    BodyWarningThreshold = 500,
    ShowWarning          = true,

    -- ── Collision-driven damage ──────────────────────────────────
    -- We detect collisions via speed-drop + HasEntityCollidedWithAnything().
    -- Extra damage is applied on top of whatever GTA natively took,
    -- bypassing armor and vehicle class padding.

    -- Minimum speed drop (m/s) that counts as a hit.
    -- ~2 m/s ≈ a gentle tap. ~5 m/s ≈ noticeable bump.
    -- Lower = more sensitive.
    CollisionMinDrop = 2.5,

    -- Speed drop value (m/s) considered a "maximum" hit (factor = 1.0).
    -- At this speed drop the full Max*HitPerImpact damage is applied.
    -- ~18 m/s ≈ ~40 mph impact. Raise to make max hits require more speed.
    CollisionScale = 18.0,

    -- Maximum engine health loss per single impact (at factor = 1.0).
    -- Engine health range is 0–1000. Default GTA full health = 1000.
    -- 200 = a max-force hit takes ~20% engine health.
    MaxEngineHitPerImpact = 220,

    -- Maximum body health loss per single impact (at factor = 1.0).
    -- Body health range is 0–1000.
    -- 280 = a max-force hit takes ~28% body health.
    MaxBodyHitPerImpact = 280,

    -- Milliseconds to ignore further collisions after one registers.
    -- Prevents a single crash registering 10 times in a row.
    CollisionCooldownMs = 600,

    -- How often (seconds) engine and body health sync to the database.
    -- Lower = more accurate after crashes, more DB writes.
    -- Matches the fuel save cadence by default.
    SaveInterval = 30,
}

-- =============================================
-- NOTIFICATIONS
-- =============================================
Config.Notifications = {
    UseOxLib = true,
    Position = 'top-right',
    Duration = 3000,
}

-- =============================================
-- DEBUG
-- =============================================
-- Debug level: false/0 = off, 1 = key events only, 2 = engine/fuel state, 3 = verbose (all)
-- You can also set Config.Debug = true to default to level 2.
Config.Debug = 0

-- =============================================
-- CARJACK / FORCEFUL EXTRACTION PROTECTION
-- =============================================
Config.Carjack = {
    -- Master switch. Set false to disable all anti-carjack logic entirely.
    Enabled = false,

    -- Block the INPUT_VEH_ATTACK / INPUT_VEH_ATTACK2 controls that let an
    -- on-foot ped drag an occupied vehicle's driver out by shooting at them
    -- or by pressing the enter-vehicle key when already beside an occupied vehicle.
    -- This is the primary carjack vector in GTA.
    BlockForcedEntry = true,

    -- After a carjack is blocked, how long (ms) before the attacker can try again.
    -- Prevents rapid spam. Set to 0 to disable the cooldown entirely.
    BlockCooldownMs = 3000,

    -- Whether to notify the ATTACKER that the vehicle is protected.
    NotifyAttacker = true,
    AttackerMessage = 'That vehicle is occupied and cannot be carjacked.',

    -- Whether to notify the VICTIM (the driver being targeted) when someone
    -- attempts to force them out.
    NotifyVictim = true,
    VictimMessage = 'Someone is trying to carjack you!',

    -- How often (ms) to re-send the victim warning while an attempt is ongoing.
    -- Prevents notification spam — only fires once per this interval.
    VictimWarnCooldownMs = 5000,

    -- Radius (metres) around the vehicle to scan for on-foot attackers.
    -- Keep this tight (~3–4 m) to avoid false positives.
    AttackerScanRadius = 3.5,

    -- If true, also protect passengers from being dragged out of their seats.
    ProtectPassengers = true,

    -- Jobs that are EXEMPT from the carjack block (e.g. police conducting
    -- lawful vehicle stops). Add job names as lowercase strings.
    -- Set to an empty table {} to protect against everyone.
    ExemptJobs = { 'police', 'sheriff', 'swat' },

    -- If true, the script will ask the server whether the attacker's job is
    -- exempt before blocking. Requires one round-trip per attempt (~50 ms).
    -- If false, exemptions are never checked and all on-foot players are blocked.
    CheckJobExemptions = true,
}

-- =============================================
-- JG-MECHANIC INTEGRATION
-- =============================================
-- Service intervals in km — must match your jg-mechanic config.
-- These determine how fast each part "wears" on the HUD.
-- Wear% = 100 - ((currentMileage - lastServicedKm) / interval * 100)
Config.Mechanic = {
    Enabled = true,          -- Set false if not running jg-mechanic
    Intervals = {
        engine_oil  = 5000,  -- Oil change every 5000 km
        brake_pads  = 20000, -- Brakes every 20000 km
        tyres       = 30000, -- Tyres every 30000 km
        suspension  = 40000, -- Suspension every 40000 km
        spark_plugs = 20000, -- Spark plugs every 20000 km
        air_filter  = 15000, -- Air filter every 15000 km
        clutch      = 50000, -- Clutch every 50000 km
    },
}