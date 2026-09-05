import webview
import os
import sys
import ctypes

ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID('neurocalcul.app')

dir_path = os.path.dirname(os.path.abspath(sys.argv[0] if getattr(sys, 'frozen', False) else __file__))
html_path = os.path.join(dir_path, 'neuro-calcul.html')

window = webview.create_window(
    'Neuro Calcul',
    html_path,
    width=620,
    height=860,
    min_size=(380, 600),
)
webview.start()
