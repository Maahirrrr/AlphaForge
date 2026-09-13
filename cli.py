import sys
import os
from pathlib import Path
import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

# Add backend to python path
BACKEND_PATH = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(BACKEND_PATH))

from app.core.config import settings
from app.data.ingestion import ingest_universe, DEFAULT_UNIVERSE
from app.services.research_service import ResearchService
from app.services.backtest_service import BacktestService
from app.services.trading_service import TradingService
from app.risk.kill_switch import kill_switch

app = typer.Typer(help="AlphaForge Quantitative Research & Algorithmic Trading CLI")
console = Console()

@app.command("status")
def system_status():
    """Display overall AlphaForge platform status and telemetry."""
    console.print(Panel(
        f"[bold white]ALPHAFORGE QUANT TERMINAL[/bold white]\n"
        f"Mode: [bold cyan]{settings.EXECUTION_MODE}[/bold cyan] | "
        f"Currency: [yellow]{settings.CURRENCY}[/yellow] | "
        f"Initial Capital: [green]{settings.INITIAL_CAPITAL:,.2f}[/green]\n"
        f"Live Enabled: [{'red' if settings.is_live_mode else 'dim'}]"
        f"{'YES' if settings.is_live_mode else 'NO'}[/{'red' if settings.is_live_mode else 'dim'}] | "
        f"Kill Switch: [{'bold red' if kill_switch.is_active else 'bold green'}]{'HALTED' if kill_switch.is_active else 'NORMAL'}[/]",
        title="Telemetry",
        border_style="cyan"
    ))

@app.command("data-download")
def data_download(universe: str = "US_TECH"):
    """Download historical market data bars for a predefined universe."""
    symbols = DEFAULT_UNIVERSE.get(universe.upper(), DEFAULT_UNIVERSE["US_TECH"])
    console.print(f"[cyan]Downloading market data for {universe} ({symbols})...[/cyan]")
    res = ingest_universe(symbols)
    console.print(f"[bold green]Successfully ingested {len(res)} symbols.[/bold green]")

@app.command("model-train")
def model_train(symbol: str = "AAPL", horizon: str = "5d"):
    """Train supervised XGBoost alpha model and perform walk-forward validation."""
    console.print(f"[cyan]Training XGBoost model for {symbol} on {horizon} horizon...[/cyan]")
    svc = ResearchService()
    res = svc.train_model(symbol=symbol, target_horizon=horizon)
    console.print(f"[bold green]Model Trained: {res['model_id']}[/bold green]")
    console.print(f"Mean Rank IC: [yellow]{res['walk_forward']['mean_rank_ic']}[/yellow] | IC IR: [yellow]{res['walk_forward']['ic_information_ratio']}[/yellow]")
    console.print(f"Directional Acc: [cyan]{res['walk_forward']['mean_directional_accuracy']:.1%}[/cyan]")

@app.command("backtest")
def run_backtest(strategy: str = "ML_CROSS_SECTIONAL"):
    """Execute event-driven backtest for a strategy."""
    console.print(f"[cyan]Running event-driven backtest for {strategy}...[/cyan]")
    svc = BacktestService()
    res = svc.run_backtest(strategy_type=strategy, universe=["AAPL", "MSFT", "NVDA"], rebalance_freq_days=10)
    
    table = Table(title=f"Backtest Metrics: {res['strategy_name']}", border_style="cyan")
    table.add_column("Metric", style="white")
    table.add_column("Value", style="green")
    
    for k, v in res["metrics"].items():
        table.add_row(k.replace("_", " ").title(), str(v))
    console.print(table)

@app.command("paper-status")
def paper_status():
    """Display current paper trading account and open positions."""
    svc = TradingService()
    status = svc.get_portfolio_status(mode="PAPER")
    acc = status["account"]
    
    console.print(Panel(
        f"Cash: [green]{acc['cash']:,.2f}[/green] | "
        f"Equity: [bold green]{acc['total_equity']:,.2f}[/bold green] | "
        f"Total P&L: [{'green' if acc['total_pnl'] >= 0 else 'red'}]{acc['total_pnl']:,.2f} ({acc['total_pnl_pct']} %)[/]",
        title="Paper Account Telemetry",
        border_style="green"
    ))
    
    positions = status["positions"]
    if positions:
        table = Table(title="Open Positions", border_style="green")
        table.add_column("Symbol")
        table.add_column("Quantity")
        table.add_column("Avg Price")
        table.add_column("Market Value")
        table.add_column("P&L")
        for p in positions:
            pnl_color = "green" if p["unrealized_pnl"] >= 0 else "red"
            table.add_row(
                p["symbol"], str(p["quantity"]), f"{p['avg_price']:,.2f}",
                f"{p['market_value']:,.2f}", f"[{pnl_color}]{p['unrealized_pnl']:,.2f}[/{pnl_color}]"
            )
        console.print(table)
    else:
        console.print("[dim]No active positions.[/dim]")

@app.command("kill-switch")
def trigger_ks(reason: str = "Manual Emergency Halt from CLI"):
    """Emergency trigger to halt trading and cancel orders."""
    kill_switch.activate(reason, user="CLI_USER")
    console.print(Panel(f"[bold red]EMERGENCY KILL SWITCH ACTIVATED[/bold red]\nReason: {reason}", border_style="red"))

if __name__ == "__main__":
    app()
