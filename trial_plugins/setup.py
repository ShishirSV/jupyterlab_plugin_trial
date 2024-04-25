from pathlib import Path
from setuptools import setup

from jupyter_packaging import (
    create_cmdclass,
    install_npm,
    ensure_targets,
    combine_commands,
)


HERE = Path(__file__).parent

trial_plugins_DIR = HERE / "trial_plugins"

jstargets = [
    (trial_plugins_DIR / "static" / "bundle.js").resolve(),
]

cmdclass = create_cmdclass("jsbuild", package_data_spec={"trial_plugins": "**"})
cmdclass["jsbuild"] = combine_commands(
    install_npm(HERE.resolve(), npm=["jlpm"], build_cmd="build"), ensure_targets(jstargets),
)

setup(cmdclass=cmdclass)
