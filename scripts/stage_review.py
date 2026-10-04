from pathlib import Path
import shutil,subprocess,sys
root=Path(__file__).resolve().parents[1]
out=Path(sys.argv[1]).resolve()
if out.exists() and any(out.iterdir()): raise SystemExit("Output must be empty")
subprocess.run([sys.executable,str(root/"scripts"/"build_gallery.py")],check=True)
out.mkdir(parents=True,exist_ok=True)
for name in ['index.html', 'privacy.html', 'robots.txt', 'sitemap.xml', '.nojekyll', '_headers', 'iambirdy.jpg']:
    shutil.copyfile(root/name,out/name)
shutil.copytree(root/"site-assets",out/"site-assets")
